# 🚀 IDLab Deployment Structure

## Firebase Project Setup

**Project:** `idlab-d9000` (Single Firebase Project with Multiple Hosting Sites)

---

## 🌐 Hosting Sites

### 1. Main Website (`idlab-d9000` site)
- **URL:** https://idlab-d9000.web.app
- **Source:** Root directory (`c:\projects\IDLab\`)
- **Content:** Main marketing website (index.html, about.html, etc.)
- **Deployment:** From root `firebase.json`

### 2. Admin Dashboard (`idlab-admin` site)
- **URL:** https://idlab-admin.web.app
- **Source:** `admin/admin-dashboard/public/`
- **Content:** Admin dashboard for approvals, licenses, payments
- **Deployment:** From root `firebase.json`

---

## 📁 Configuration Files

### Root Configuration (`c:\projects\IDLab\`)

**`.firebaserc`**
```json
{
  "projects": {
    "default": "idlab-d9000"
  }
}
```

**`firebase.json`**
```json
{
  "hosting": [
    {
      "site": "idlab-d9000",
      "public": ".",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**", "admin/**"]
    },
    {
      "site": "idlab-admin",
      "public": "admin/admin-dashboard/public",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### Admin Dashboard Configuration (`c:\projects\IDLab\admin\admin-dashboard\`)

**`.firebaserc`**
```json
{
  "projects": {
    "default": "idlab-d9000"
  }
}
```

**`firebase.json`**
```json
{
  "functions": {
    "source": "functions"
  },
  "hosting": {
    "site": "idlab-admin",
    "public": "public"
  }
}
```

---

## 🚀 Deployment Commands

### Deploy Everything (Recommended)
```powershell
# From root directory
cd c:\projects\IDLab
firebase deploy
```

This deploys:
- ✅ Main website → idlab-d9000 site
- ✅ Admin dashboard → idlab-admin site
- ✅ Cloud Functions
- ✅ Firestore rules

### Deploy Main Website Only
```powershell
cd c:\projects\IDLab
firebase deploy --only hosting:idlab-d9000
```

### Deploy Admin Dashboard Only
```powershell
cd c:\projects\IDLab
firebase deploy --only hosting:idlab-admin
```

### Deploy Cloud Functions Only
```powershell
cd c:\projects\IDLab\admin\admin-dashboard
firebase deploy --only functions
```

---

## 🔍 Why This Structure?

### Single Project, Multiple Sites
- **Cost Efficient:** One Firebase project handles both sites
- **Shared Resources:** Same Firestore, Functions, Auth
- **Unified Management:** One console for everything
- **Separate Deployments:** Can deploy sites independently

### Separate Hosting Sites
- **Different URLs:** Main site vs Admin dashboard
- **Access Control:** Can restrict admin site separately
- **Independent Updates:** Update admin without touching main site
- **Clear Separation:** Marketing content vs Admin tools

---

## 📊 Current Deployment Status

✅ **Main Website:** https://idlab-d9000.web.app  
✅ **Admin Dashboard:** https://idlab-admin.web.app  
✅ **Cloud Functions:** Deployed to `us-central1`  
✅ **Firestore:** Active with rules  

---

## 🔒 Custom Domain Setup (Optional)

### Main Website
```powershell
firebase hosting:sites:list
firebase target:apply hosting main idlab-d9000
# Then add custom domain in Firebase Console
# Example: www.idlab.studio → idlab-d9000 site
```

### Admin Dashboard
```powershell
firebase target:apply hosting admin idlab-admin
# Then add custom domain in Firebase Console
# Example: admin.idlab.studio → idlab-admin site
```

---

## ⚠️ Important Notes

1. **Always deploy from root** (`c:\projects\IDLab\`) to ensure both sites update
2. **Functions must be deployed** from `admin/admin-dashboard/` directory
3. **Both sites share** the same Firestore database
4. **Admin dashboard** requires authentication
5. **Main website** is public-facing

---

## 🧪 Testing URLs

### Production URLs
- Main: https://idlab-d9000.web.app
- Admin: https://idlab-admin.web.app

### Verify Deployment
```powershell
firebase hosting:sites:list
firebase functions:list
```

---

## 📝 Deployment Checklist

Before deploying:
- [ ] Test locally with `firebase serve`
- [ ] Check `.firebaserc` points to `idlab-d9000`
- [ ] Verify `firebase.json` has both hosting configurations
- [ ] Test Cloud Functions locally if changed
- [ ] Review Firestore rules if modified

After deploying:
- [ ] Verify main website loads correctly
- [ ] Test admin dashboard login
- [ ] Check Cloud Functions are active
- [ ] Test approval workflow
- [ ] Verify email sending works

---

## 🎉 Success!

Your IDLab deployment structure is now correctly configured:

✅ Single Firebase project (`idlab-d9000`)  
✅ Two hosting sites (main + admin)  
✅ Shared backend resources  
✅ Independent deployment capability  

**Ready to deploy?**
```powershell
cd c:\projects\IDLab
firebase deploy
```
