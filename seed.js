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

    // 4. ONAY BEKLEYEN KULLANICI SEED (TC020, TC021 Onay Bekleyenler sekmesi testi)
    let { data: usrs } = await supabase.from('users').select('*').eq('email', 'pending_test@example.com');
    if (!usrs || usrs.length === 0) {
        await supabase.from('users').insert({
            id: crypto.randomUUID(), // Rastgele UUID
            email: "pending_test@example.com",
            name: "Pending TestUser",
            role: "CLIENT",
            approved: false
        });
        console.log("⏳ Pending Registration User (Onay Bekleyenler) seeded.");
    } else {
        console.log("⏳ Pending Registration User already exists.");
    }

    // 5. BLOG İÇERİĞİ SEED (Content API / TC028 Testi)
    await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    let { data: blogs } = await supabase.from('blog_posts').select('*').eq('title', "E2E Test Blogu");
    if (!blogs || blogs.length === 0) {
        const { error: blogE } = await supabase.from('blog_posts').insert({
            title: "E2E Test Blogu",
            excerpt: "Bu blog E2E testleri tarafından görülmesi için eklendi.",
            content: "<p>Tam içerik detayları buradadır.</p>",
            image: "https://via.placeholder.com/600",
            date: new Date().toISOString().split('T')[0]
        });
        if (blogE) console.error("❌ Blog Insert Error:", blogE);
        else console.log("📝 Blog Post seeded.");
    } else {
        console.log("📝 Blog Post already exists.");
    }

    console.log("✅ All test data seeded successfully. Testler artık tıklanabilir nesneler bulacak.");
    process.exit(0);
}

run();
