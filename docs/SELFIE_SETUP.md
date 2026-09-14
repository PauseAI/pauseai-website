# Selfie Upload Feature Setup

This feature allows supporters to upload selfies for the AI safety book campaign collage.

## Quick Start for Developers

You have two options:

### Option A: Use Anthony's Shared Test Account (Easiest)

- Cloud name and API key are already in `.env`
- Get the `CLOUDINARY_API_SECRET` from Psono (shared password manager)
- You're sharing Anthony's test account - that's fine for prototyping!
- Note: Production will use a different account once we're done testing

### Option B: Use Your Own Free Cloudinary Account

Follow the setup below if you want your own isolated testing environment.

#### Creating Your Own Free Account:

1. Sign up at https://cloudinary.com/users/register_free (use GitHub login if you prefer)
2. You'll get:
   - 25GB storage
   - 25GB bandwidth/month
   - 3 user accounts
   - All features we need for testing

### 2. Configure Upload Preset

In your Cloudinary dashboard:

1. Go to **Settings** → **Upload** → **Upload Presets**
2. Click **Add upload preset**
3. Configure with these EXACT settings:
   - **Preset name**: `selfie`
   - **Signing Mode**: **Unsigned**
   - **Folder**: Leave empty (we set in code)
   - **Access control**: Leave as is

4. Under **Upload Manipulations** → **Incoming Transformation**:
   - Edit → Add transformation
   - Enter: `c_fill,g_face,ar_3:4,w_1500,h_2000,q_auto`
   - This auto-detects faces and creates consistent 3:4 portraits

5. Under **Upload Control** → **Moderation**:
   - Set to **Manual**
   - This makes photos appear in the Moderation tab for review

6. Save the preset

### 3. Get Your Credentials

From your Cloudinary dashboard homepage, you'll see:

- **Cloud Name**: (e.g., `dyjlw1syg`)
- **API Key**: (e.g., `123456789012345`)
- **API Secret**: (keep this private!)

### 4. Environment Variables

Add to your `.env` file:

```bash
# Selfie Campaign - Cloudinary settings
PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"  # Can be shared
CLOUDINARY_API_KEY="your-api-key"               # Can be shared
CLOUDINARY_API_SECRET="your-api-secret"         # KEEP PRIVATE - never commit!
```

**Important**:

- `API_SECRET` must NEVER be committed to source control
- `CLOUD_NAME` and `API_KEY` are safe to share
- For production, all three will be set in Netlify environment variables

### 5. Optional: Create Second Preset for Blurred Images

If you want blur to create a permanent blurred version (not just display blur):

1. Create another preset called `selfie_masked`
2. Same settings as above, but incoming transformation:
   - `c_fill,g_face,ar_3:4,w_1500,h_2000,q_auto/e_blur_faces:2000`

## Testing the Feature

1. Run development server: `pnpm dev`
2. Visit: http://localhost:5173/selfie
3. Upload a photo (camera, file, or social media)
4. Test the flow:
   - Photo should auto-crop to face
   - Blur button should work (requires API credentials)
   - Remove button should delete from Cloudinary
   - Email submission should add to metadata

## How It Works

### Upload Flow:

1. **Client**: Unsigned upload via widget → Cloudinary
2. **Cloudinary**: Applies face detection & crop
3. **Client**: Shows confirmation screen
4. **User** can:
   - Blur face (server endpoint replaces image)
   - Add email (server endpoint updates metadata)
   - Remove (server endpoint deletes from Cloudinary)

### File Organization in Cloudinary:

```
test_prototype/    # Test phase uploads (all in one folder)
```

### Moderation Status (Automatic):

Photos uploaded with `moderation: 'manual'` automatically get:

- `pending` status - Shows in Moderation tab for review
- Can be changed to `approved` or `rejected` via Cloudinary UI

### Tags Applied:

- `test_prototype` - Development/testing phase
- `selfie` - Identifies as selfie upload
- `has_email` - User provided email (added if email provided)
- `face_masked` - User requested blur

### Metadata Stored:

- `uploaded_at` - Timestamp
- `email` - If provided by user
- Plus EXIF data (camera, location if present)

## Review Process

1. Log into Cloudinary Console
2. Go to **Media Library → Moderation** tab
3. Photos appear automatically with "pending" status
4. Review and click to approve or reject each photo
5. Approved photos remain in the library
6. Rejected photos can be deleted or kept separate

## Troubleshooting

**"Server configuration error"**:

- Check your API credentials in `.env`
- Ensure `CLOUDINARY_API_SECRET` is set

**Face detection not working**:

- Check upload preset has the incoming transformation
- Some angles/lighting may challenge detection

**Blur not applying**:

- Requires valid API credentials
- Check server console for errors

## Production Notes

For production deployment:

- Cloudinary nonprofit discount available (typically 25-50% off)
- Set environment variables in Netlify dashboard
- Consider webhook integration for automated approval workflow
- Email service integration for notifications

## Privacy & GDPR

- Emails stored in Cloudinary metadata (not publicly accessible)
- Users can request removal via the interface
- Face blur option provided for privacy
- Consider adding privacy policy link
