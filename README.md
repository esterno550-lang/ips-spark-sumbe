# IPS Futures Portal

​Project Overview:

Build a modern, responsive, and accessible academic website for "Instituto Politécnico do Sumbe (IPS)". The site serves as a portal for prospective students, current students, and faculty. Maintain the exact original focus: technical education, innovation, and impact in Sumbe.

​Tech Stack & Libraries:

​React (Functional Components)

​Tailwind CSS for styling

​shadcn/ui for UI components (Buttons, Cards, Badges, Inputs, Tabs, DropdownMenus)

​framer-motion for smooth, modern animations (specifically fade-up reveals)

​lucide-react for icons

​Design System & Color Palette:

Apply this exact brand palette globally using Tailwind arbitrary values or custom theme variables:

​Navy: #162a4e (Primary brand color, dark backgrounds)

​Blue: #274b73 (Secondary accents, text highlights)

​Accent: #59dce4 (Bright highlights, glowing background effects)

​Muted: #9bb2c2 (Subtle text, secondary UI elements)

​Ice: #d2dfe6 (Borders, card outlines, subtle backgrounds)

​Styling note: heavily use rounded corners (rounded-2xl and rounded-xl) for buttons, cards, drop-downs, and inputs to match a modern, friendly aesthetic. Use background blurs (backdrop-blur) for the sticky header.

​Core Structure & Components:

Create a main view that uses a Tabs component to navigate between three main sections: "Home", "Programs", and "News & Events".

 ​Global Navigation (Sticky Header):

​Left: IPS Logo placeholder and institution name.

​Center: Dropdown menus for (Academics, Admissions, Research, Campus Life, Athletics).

​Right: Search input, an "Admissions" primary CTA button (Navy background), and a mobile hamburger menu.

 ​Home Tab (Hero Section):

​Large engaging headline: "Formação técnica, inovação e impacto — construindo futuros no Sumbe."

​Description paragraph and CTAs ("Explore programs", "Plan a visit").

​Grid of 4 small stat cards (e.g., "170+ Programs", "1,000+ Faculty").

​Quick Links card with icons (Request info, Find major, Campus safety).

​Background: Include large, absolute positioned, blurry decorative circles using the Accent and Blue colors with low opacity.

 ​Programs Tab (Program Finder):

​A search bar and a dropdown filter (Area/Category) to find academic courses.

​A responsive grid of Cards displaying programs (e.g., Mechanical Engineering, Computer Science).

​Include dynamic filtering logic: updating the search input or dropdown should instantly filter the visible cards.

 ​News & Events Tab:

​Two-column layout on large screens.

​Left column: Recent News list with title, category badge, and date.

​Right column: Upcoming Events list with title, time, location, and an "Add to calendar" button.

​Global Footer:

​Multi-column layout with the IPS logo, a brief description, large link grids replicating the navigation, and a bottom bar with copyright and legal links.

​Behavior & Animation:

All major sections and card grids should use Framer Motion to animate into view (fadeUp from y: 14 and opacity: 0 to y: 0 and opacity: 1 with a duration of 0.6s). Make sure the layout is fully responsive for mobile devices

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://ips-spark-sumbe.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f2d522e7-8271-46cf-b91e-d0d244e73ebd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
