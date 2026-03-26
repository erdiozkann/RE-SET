import requests
import uuid

BASE_URL = "http://localhost:4173"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "StrongAdminPass123!"

def test_admin_dashboard_blog_post_creation():
    session = requests.Session()
    timeout = 30

    blog_post_id = None

    try:
        # 1. Authenticate as admin via supabase.auth.signInWithPassword
        auth_url = f"{BASE_URL}/auth/v1/token"
        auth_payload = {
            "grant_type": "password",
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
        }
        headers = {"Content-Type": "application/json"}
        auth_resp = session.post(auth_url, json=auth_payload, headers=headers, timeout=timeout)
        assert auth_resp.status_code == 200, f"Auth failed: {auth_resp.text}"
        auth_data = auth_resp.json()
        access_token = auth_data.get("access_token")
        assert access_token, "No access_token received in auth response"

        # Update Authorization header for subsequent calls
        session.headers.update({"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"})

        # 2. Create a new blog post using supabase.from('blog_posts').insert (POST to /rest/v1/blog_posts)
        blog_post_id = str(uuid.uuid4())
        new_post = {
            "id": blog_post_id,
            "title": "Test Blog Post " + blog_post_id,
            "content": "This is a test blog post created during automated testing.",
            "author": "admin",
            "published": True
        }
        insert_url = f"{BASE_URL}/rest/v1/blog_posts"
        insert_resp = session.post(insert_url, json=new_post, timeout=timeout)
        assert insert_resp.status_code in (200, 201), f"Blog post creation failed: {insert_resp.text}"
        inserted = insert_resp.json()
        assert isinstance(inserted, list) and inserted, "Unexpected insert response format"
        inserted_post = inserted[0]
        assert inserted_post.get("id") == blog_post_id, "Inserted blog post ID mismatch"

        # 3. Verify the new post appears in the blog posts listing (GET /rest/v1/blog_posts?select=*&id=eq.{blog_post_id})
        params = {"id": f"eq.{blog_post_id}"}
        select_resp = session.get(insert_url, params=params, timeout=timeout)
        assert select_resp.status_code == 200, f"Failed to fetch created blog post: {select_resp.text}"
        posts = select_resp.json()
        assert isinstance(posts, list) and any(p.get("id") == blog_post_id for p in posts), "Created blog post not found in listing"

    finally:
        # Cleanup: delete the created blog post if created
        if blog_post_id is not None:
            try:
                delete_url = f"{BASE_URL}/rest/v1/blog_posts?id=eq.{blog_post_id}"
                del_resp = session.delete(delete_url, timeout=timeout)
                # Accept 204 No Content or 200 OK for deletion success
                assert del_resp.status_code in (200, 204), f"Failed to clean up blog post: {del_resp.text}"
            except Exception as e:
                print(f"Cleanup failed: {e}")

test_admin_dashboard_blog_post_creation()