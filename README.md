# Little Bets

A simple web application for creating and participating in friendly bets with your friends and colleagues.

## Features

- Create different types of bets:
  - Yes/No bets
  - Number predictions
  - Custom option bets
- View all bets in a clean, responsive interface
- Make predictions on existing bets
- See all predictions for each bet

## Tech Stack

- React
- TypeScript
- Supabase (PostgreSQL database)
- Vite
- React Router
- Vanilla CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/little-bets.git
   cd little-bets
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Database Setup

The application requires two tables in your Supabase database:

### `bets` Table

```sql
CREATE TABLE bets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  code_name TEXT UNIQUE DEFAULT LOWER(SUBSTRING(REPLACE(uuid_generate_v4()::TEXT, '-', '') FROM 1 FOR 8)),
  creator_name TEXT NOT NULL,
  bettype TEXT NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  unit TEXT,
  min_value INTEGER,
  max_value INTEGER,
  customoption1 TEXT,
  customoption2 TEXT
);
```

### `bet_participants` Table

```sql
CREATE TABLE bet_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  bet_id UUID REFERENCES bets(id) NOT NULL,
  name TEXT NOT NULL,
  prediction TEXT NOT NULL
);
```

## Deployment

### Deploying to Netlify

1. Create a new site on Netlify.

2. Connect your GitHub repository.

3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

4. Add your environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Deploy the site.

### Troubleshooting Deployment Issues

If your changes aren't showing up after deployment:

1. **Clear browser cache**: Try hard-refreshing your browser (Ctrl+F5 or Cmd+Shift+R).

2. **Check build logs**: Review the Netlify build logs for any errors.

3. **Verify environment variables**: Make sure your Supabase credentials are correctly set.

4. **Check Netlify redirects**: Ensure your `netlify.toml` file has the proper redirect rules for client-side routing:
   ```toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

5. **Test locally with production build**:
   ```
   npm run build
   npm run preview
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 