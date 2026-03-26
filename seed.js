import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    console.log("🚀 Seeding test data into Supabase...");

    // Güvenlik izinlerini (RLS) geçmek için Admin hesabınızla giriş simülesi yapıyoruz
    const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
        email: process.env.VITE_DEMO_EMAIL,
        password: process.env.VITE_DEMO_PASSWORD
    });

    if (authError) {
        console.error("❌ Auth Failed. Env bilgilerinizi kontrol edin:", authError);
        return;
    }
    console.log("🔑 Logged in successfully as Admin.");

    const clientEmail = 'client_test_1@example.com';

    // 1. DANIŞAN SEED (Clients Tab / TC017, TC018 Testleri İçin)
    let { data: clients } = await supabase.from('clients').select('*').eq('email', clientEmail);
    if (!clients || clients.length === 0) {
        await supabase.from('clients').insert({
            name: "Test Danisan",
            email: clientEmail,
            phone: "+905554443322"
        });
        console.log("👥 Client (Danışan) seeded.");
    } else {
        console.log("👥 Client (Danışan) already exists.");
    }

    // 2. HİZMET / SERVİS SEED (TC008 ve Randevu için gerekir)
    let { data: svcs } = await supabase.from('services').select('*').limit(1);
    let serviceId = null;
    if (!svcs || svcs.length === 0) {
        const { data: svcNew, error: svcE } = await supabase.from('services').insert({
            title: "Test Danismanligi",
            duration: "60 DK",
            price: 1500,
            description: "Bu hizmet otomasyon amaciyla olusturuldu.",
            image: "https://via.placeholder.com/150",
            order_index: 0
        }).select().single();
        if (svcE) console.error("Service Insert Error", svcE);
        else {
            serviceId = svcNew.id;
            console.log("🛠️ Service (Hizmet) seeded.");
        }
    } else {
        serviceId = svcs[0].id;
        console.log("🛠️ Service (Hizmet) already exists.");
    }

    // 3. RANDEVU SEED (TC012, TC013 testleri bekleyen randevu listesi bekliyor)
    if (serviceId) {
        let { data: appts } = await supabase.from('appointments').select('*').eq('status', 'Pending');
        if (!appts || appts.length === 0) {
            await supabase.from('appointments').insert({
                service_id: serviceId,
                service_title: "Test Danismanligi",
                client_name: "Test Danisan",
                client_email: clientEmail,
                appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
                appointment_time: "14:00",
                status: "Pending",
                notes: "Lutfen testlerde bu randevuyu otomatik onaylatın"
            });
            console.log("📅 Appointment (Randevu - Pending) seeded.");
        } else {
            console.log("📅 Appointment (Randevu) already exists.");
        }
    }

    // 4. TEST KULLANICI SEED (TC009, TC019, TC026-029 Testleri İçin)
    const testUserEmail = 'example@gmail.com';
    const testUserPass = 'password123';
    
    // Auth'da kullanıcı yoksa oluştur (Supabase Auth API kullanarak)
    // Not: signUp admin yetkisi gerektirebilir veya hCaptcha/Verification takılabilir. 
    // Bu yüzden 'users' tablosuna manuel ekleme ve Auth tarafında varlığını varsayma stratejisi izliyoruz.
    // Ancak en doğrusu Auth service ile oluşturmaktır.
    
    let { data: testUsrs } = await supabase.from('users').select('*').eq('email', testUserEmail);
    if (!testUsrs || testUsrs.length === 0) {
        let userId = crypto.randomUUID();
        
        // 1. Auth SignUp
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testUserEmail,
            password: testUserPass,
            options: { data: { name: "Test Playwright" } }
        });

        if (signUpError) {
            console.warn(`⚠️ Auth SignUp failed (${testUserEmail}): ${signUpError.message}`);
        }

        if (signUpData.user) {
            userId = signUpData.user.id;
        } else if (signUpError && signUpError.message.includes('already registered')) {
            // Already registered? Fine.
        }

        // 2. Insert into users table
        await supabase.from('users').insert({
            id: userId,
            email: testUserEmail,
            name: "Test Playwright",
            role: "CLIENT",
            approved: true
        });
        console.log("👤 Test User (example@gmail.com) seeded.");
    } else {
        console.log("👤 Test User already exists.");
    }

    // 5. BLOG İÇERİĞİ SEED (Existing columns only to prevent PGRST204)
    // Önce temizle (Test stabilitesi için)
    await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    const blogEntries = [];
    for (let i = 1; i <= 10; i++) {
        blogEntries.push({
            title: i === 1 ? "E2E Test Blogu" : `Blog Yazısı ${i}`,
            excerpt: `Bu blog yazısı ${i} E2E testleri için otomatik eklendi.`,
            content: `<p>Blog yazısı ${i} detaylı içeriği burada yer almaktadır.</p>`,
            image: "https://via.placeholder.com/600",
            // NOT: category, readTime, featured, status şu an DB şemasında bulunmadığı için kaldırıldı.
            // Bu sütunlar eklendiğinde tekrar aktifleştirilebilir.
            date: new Date().toISOString().split('T')[0]
        });
    }

    const { error: blogE } = await supabase.from('blog_posts').insert(blogEntries);
    if (blogE) console.error("❌ Blog Insert Error:", blogE);
    else console.log(`📝 ${blogEntries.length} Blog Posts seeded (minimal schema).`);

    console.log("✅ Seed complete. NOTE: Registration (signUp) might still fail due to server-side DB triggers or missing INSERT policies for users table.");
    process.exit(0);
}

run();
