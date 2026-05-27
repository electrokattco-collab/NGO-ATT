# TSOGA AFRICAN CHILD NPC - Static Site (GitHub Pages)

This is the **static GitHub Pages version** of the Tsoga African Child NPC website. It contains pure HTML, CSS, and JavaScript with no build steps, no server requirements, and no external dependencies.

## About Tsoga African Child NPC

**Tsoga African Child NPC** is a registered Non-Profit Company dedicated to addressing trauma and mental wellness among South African school learners through comprehensive, school-based intervention programs.

- **Legal Name:** Tsoga African Child NPC
- **Registration Number:** 2024/659725/08
- **Tax Number:** 9641744199
- **Program:** Supporting Resilience Mental Wellness (SRMW) Initiative
- **Founded:** 2024
- **Location:** 7 Ramskin, Atteridgeville, Pretoria, 0008

## Our Mission

To provide sustained, evidence-based intervention programs that support the holistic well-being of learners through comprehensive counselling services, educator empowerment, and family engagement, ultimately improving learner behaviour, academic performance, and life outcomes over an extended period of eight years or more.

## Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Landing page with mission overview |
| About | `about.html` | Organization story, vision, mission, team |
| Programs | `programs.html` | SRMW program details and services |
| Volunteer | `volunteer.html` | Volunteer application form (Formspree) |
| Donations | `donations.html` | Donation information and methods |
| Contact | `contact.html` | Contact form (Formspree) and office info |
| Blog | `blog.html` | News, insights, and stories |

## File Structure

```
├── index.html          # Homepage
├── about.html          # About page
├── programs.html       # SRMW Program page
├── volunteer.html      # Volunteer form
├── donations.html      # Donations page
├── contact.html        # Contact form
├── blog.html           # Blog page
├── css/
│   └── style.css       # All styles (African-inspired theme)
├── js/
│   └── main.js         # All JavaScript
├── assets/
│   └── images/         # Image assets (place your photos here)
└── README.md           # This file
```

## Images

To add your organization's photos:

1. Place your images in the `assets/images/` folder
2. Update the `src` attributes in the HTML files to point to your images
3. Images currently use Unsplash placeholders with `onerror` fallbacks

**Recommended image sizes:**
- Hero images: 1200x800px
- Team photos: 400x400px (square)
- Blog thumbnails: 800x600px
- Program images: 800x600px

## Contact Information

- **Founder & CEO:** Anna Koketso Mmatshaka
- **Phone:** 078 646 3882
- **Email:** tsogaafricanchild@gmail.com
- **Website:** electrokattco-collab.github.io/NGO-ATT
- **Address:** 7 Ramskin, Atteridgeville, Pretoria, 0008


### Active Form Endpoints

| Form | Form ID | Endpoint URL | Used In |
|------|---------|--------------|---------|
| **Contact Form** | `xredrzqw` | `https://formspree.io/f/xredrzqw` | `contact.html` |
| **Volunteer Form** | `xdajynzk` | `https://formspree.io/f/xdajynzk` | `volunteer.html` |
| **Newsletter** | `xpqnkadk` | `https://formspree.io/f/xpqnkadk` | All pages (footer) |

### How It Works

The forms use the **Basic HTML** integration method - when a user submits a form, the data is sent directly to Formspree's servers via POST request. Formspree then forwards the submission to your email and stores it in your dashboard.

### Testing the Forms

1. Deploy the updated site to GitHub Pages
2. Visit each form page and submit a test entry:
   - Go to **Contact** page → Send a test message
   - Go to **Volunteer** page → Submit a test application
   - Enter an email in any **Newsletter** signup → Subscribe
3. Check your email (and spam folder) for submission notifications
4. Log into your [Formspree dashboard](https://formspree.io) to view all submissions

### Formspree Free Plan Limits
- **50 submissions per month per form**
- Email notifications sent to registered email
- All submissions stored in dashboard for 30 days


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
The CSS uses an African-inspired color palette with earth tones:
- **Primary Green:** #2D5A3D (represents growth and healing)
- **Accent Gold:** #D4A84B (represents African heritage and warmth)
- **Dark:** #1A1A1A (for text and dark sections)

Edit the CSS variables in `css/style.css` at the `:root` selector to customize.

### Content
All content is in plain HTML. Edit the `.html` files directly to update text, images, and links.

## Tax Deductibility

Tsoga African Child NPC is a registered Non-Profit Company (2024/659725/08) with SARS tax number 9641744199. Donations may be tax-deductible under Section 18A. Contact us for tax certificates.

---

**TSOGA AFRICAN CHILD NPC** — Awaken. Thrive. Transform.

Supporting Resilience Mental Wellness Initiative for South African learners.

NPC Registration: 2024/659725/08 | Tax: 9641744199
