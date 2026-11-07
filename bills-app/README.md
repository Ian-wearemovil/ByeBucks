# Bills Tracker PWA

A Progressive Web App for tracking monthly bills with due dates, notifications, and receipt uploads.

## Features

- ✅ Track bills per month with due dates
- ✅ Configurable notification reminders (set days before due date)
- ✅ Upload screenshots/receipts when bills are paid
- ✅ Tag bills as recurring
- ✅ Minimal, clean mobile-optimized design
- ✅ PWA with offline support (manifest, service worker, icons)
- ✅ Postgres database for data persistence
- ✅ Installable on iOS and Android devices

## Tech Stack

- **Framework**: Next.js 15 (React 19)
- **Database**: PostgreSQL (with PGlite for local development)
- **Styling**: Vanilla CSS with mobile-first responsive design
- **PWA**: Service Worker, Web App Manifest, Push Notifications

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

The app uses PGlite (in-memory Postgres) for local development, so no database setup is required.

## Database Schema

The app uses a single `bills` table with the following structure:

- `id` - Auto-incrementing primary key
- `owner` - User identifier
- `name` - Bill name
- `amount` - Bill amount (decimal)
- `due_date` - When the bill is due
- `month` - Month number (1-12)
- `year` - Year
- `is_recurring` - Whether the bill repeats
- `is_paid` - Payment status
- `paid_at` - When payment was marked
- `receipt_url` - Path to uploaded receipt
- `notification_days` - Days before due date to remind
- `created_at` - Record creation time
- `updated_at` - Last update time

## API Endpoints

### Bills
- `GET /api/bills?month={month}&year={year}` - Get bills for a month
- `POST /api/bills` - Create a new bill
- `PUT /api/bills/[id]` - Update a bill
- `DELETE /api/bills/[id]` - Delete a bill

### Upload
- `POST /api/upload` - Upload a receipt image

### Notifications
- `GET /api/notifications` - Get pending bill reminders

## PWA Features

### Installation
The app can be installed on iOS/Android devices:
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the "Install" button or use "Add to Home Screen"
3. The app will appear as a standalone app icon

### Offline Support
The service worker caches core assets for offline access.

### Push Notifications
The app requests notification permissions and checks for upcoming bills hourly, sending reminders based on the configured days before the due date.

## Publishing to Cursor

To publish this app using Cursor's hosting:

1. Push this code to a GitHub repository:
```bash
git remote add origin https://github.com/YOUR_USERNAME/bills-tracker.git
git push -u origin main
```

2. In Cursor, create a new Cloud Agent run from that repository

3. In the agent, run:
```bash
cd bills-app
npm run dev
```

4. Call the publish-app tool:
```
Use the cursor-cloud-publish-app tool with:
- project_dir: "bills-app"
- suggested_slug: "bills-tracker"
- note: "Track your monthly bills with due dates, reminders, and receipt uploads."
- preview_url: "http://127.0.0.1:3000"
```

The app will be deployed with:
- Automatic HTTPS
- Postgres database provisioning
- CDN distribution
- iOS/Android PWA support

## Usage

### Adding a Bill
1. Click the "+" button
2. Enter bill details (name, amount, due date)
3. Set reminder days (default: 3 days before)
4. Mark as recurring if needed
5. Click "Add Bill"

### Marking as Paid
1. Find the bill in the list
2. Click "Mark Paid"
3. Optionally upload a receipt screenshot

### Navigating Months
Use the arrow buttons at the top to move between months and see bills for different periods.

### Viewing Summary
The dashboard shows:
- Total bills amount
- Paid amount (in green)
- Unpaid amount (in red)

## File Structure

```
bills-app/
├── app/
│   ├── api/
│   │   ├── bills/
│   │   │   ├── route.ts          # List & create bills
│   │   │   └── [id]/route.ts     # Update & delete bills
│   │   ├── notifications/route.ts # Get reminders
│   │   └── upload/route.ts       # Upload receipts
│   ├── page.tsx                  # Main app UI
│   ├── layout.tsx                # App layout
│   └── globals.css               # Styles
├── migrations/
│   └── 001_create_bills.sql      # Database schema
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service worker
│   ├── sw-register.js            # SW registration
│   ├── icon-192.png              # App icon (small)
│   └── icon-512.png              # App icon (large)
├── scripts/
│   ├── migrate.mjs               # DB migration runner
│   └── generate-icons.mjs        # Icon generator
├── src/lib/
│   └── db.ts                     # Database client
└── package.json
```

## Future Enhancements

Potential features to add:
- [ ] Bill categories and filtering
- [ ] Payment history tracking
- [ ] Budget goals and alerts
- [ ] Export to CSV/PDF
- [ ] Multi-user support with identity
- [ ] Recurring bill auto-generation
- [ ] Charts and spending analytics
- [ ] Integration with bank APIs
- [ ] Split bills with roommates
- [ ] Currency conversion

## License

MIT
