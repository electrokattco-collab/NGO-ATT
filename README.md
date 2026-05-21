# ATT NGO - Static Site (GitHub Pages)

This is the **static GitHub Pages version** of the ATT NGO website. It contains pure HTML, CSS, and JavaScript with no build steps, no server requirements, and no external dependencies.

## Branch Information

- **`main`** (this branch): Static GitHub Pages site — what you're viewing now
- **`development`**: Full-stack React + TypeScript + Firebase version with admin dashboard and dynamic features

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with mission overview |
| About | `about.html` | Organization story, mission, vision, team |
| Programs | `programs.html` | Mental wellness intervention programs |
| Volunteer | `volunteer.html` | Volunteer application form (Formspree) |
| Donations | `donations.html` | Donation information and methods |
| Contact | `contact.html` | Contact form (Formspree) and office info |
| Blog | `blog.html` | Static blog posts and articles |

## File Structure

```
├── index.html          # Homepage
├── about.html          # About page
├── programs.html       # Programs page
├── volunteer.html      # Volunteer form
├── donations.html      # Donations page
├── contact.html        # Contact form
├── blog.html           # Blog page
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # All JavaScript
└── README.md           # This file
```

## Features Removed from Full-Stack Version

The following features from the `development` branch are **not available** in this static version:

- ❌ Admin dashboard (requires authentication)
- ❌ Firebase integration (authentication, Firestore, Storage)
- ❌ Express.js backend API
- ❌ Dynamic blog post creation/editing
- ❌ Payment gateway integration (PayFast/Yoco)
- ❌ Real-time data fetching
- ❌ User authentication
- ❌ File uploads

## Forms Configuration

The contact and volunteer forms use **Formspree** for form submissions. To make them work:

1. Sign up at [formspree.io](https://formspree.io)
2. Create two forms (contact and volunteer)
3. Replace `YOUR_FORM_ID` in the following files:
   - `contact.html` — line with `action="https://formspree.io/f/YOUR_FORM_ID"`
   - `volunteer.html` — line with `action="https://formspree.io/f/YOUR_FORM_ID"`

## Enabling GitHub Pages

To deploy this site on GitHub Pages:

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select **Deploy from a branch**
4. Select **`main`** branch and **`/` (root)** folder
5. Click **Save**
6. Your site will be available at `https://yourusername.github.io/your-repo-name`

## Local Development

Since this is a static site, no build tools are required. Simply:

```bash
# Clone the repository
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name

# Open in browser (macOS)
open index.html

# Or use a simple HTTP server for better compatibility
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Customization

### Colors
Edit the CSS variables in `css/style.css` at the `:root` selector:

```css
:root {
  --color-primary: #1a5f3f;      /* Main brand color */
  --color-accent: #22c55e;       /* Accent color */
  --color-dark: #111827;         /* Dark backgrounds */
  /* ... */
}
```

### Content
All content is in plain HTML. Edit the `.html` files directly to update text, images, and links.

### Images
Replace image URLs in the HTML files. Current images use Unsplash placeholders.

## Full-Stack Version

For the full-featured version with:
- React + TypeScript frontend
- Firebase backend (Auth, Firestore, Storage)
- Express.js API server
- Admin dashboard
- Payment integration

Switch to the `development` branch:

```bash
git checkout development
```

See `README.md` on that branch for setup instructions.

---

**ATT NGO** — Awaken. Thrive. Transform.  
Empowering South African learners through mental wellness initiatives.

NPO Registration: IT000123/2026/ZA
