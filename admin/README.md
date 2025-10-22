# My FastAPI App

This project is a web-based application that combines a FastAPI backend with a Firebase-hosted dashboard. The dashboard provides an interface for admin users to manage payments, licenses, and user statistics.

## Project Structure

```
my-fastapi-app
├── admin-dashboard
│   ├── public
│   │   ├── index.html          # Main HTML file for the dashboard
│   │   ├── login.html          # Login page for user authentication
│   │   ├── css
│   │   │   ├── main.css        # Main styles for the dashboard layout
│   │   │   └── dashboard.css    # Styles specific to the dashboard interface
│   │   ├── js
│   │   │   ├── firebase-config.js # Firebase configuration settings
│   │   │   ├── auth.js         # User authentication functionalities
│   │   │   ├── dashboard.js     # Main dashboard functionalities
│   │   │   ├── payments.js      # Payment management functionalities
│   │   │   ├── licenses.js      # License management functionalities
│   │   │   └── statistics.js     # Statistics display and calculation
│   │   └── assets
│   │       └── logo.png        # Logo image for the dashboard
│   ├── firebase.json           # Firebase Hosting configuration
│   ├── .firebaserc             # Firebase project configuration
│   └── README.md                # Documentation for the dashboard project
├── src
│   └── (your existing FastAPI code) # FastAPI application code
└── README.md                    # Overall project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-fastapi-app
   ```

2. **Install dependencies**:
   For the FastAPI backend, ensure you have Python and the necessary packages installed. You can use pip to install the required packages listed in your `requirements.txt`.

3. **Firebase Configuration**:
   - Set up a Firebase project and configure the necessary services (Authentication, Firestore, etc.).
   - Update the `firebase-config.js` file with your Firebase project settings.

4. **Run the FastAPI application**:
   Start your FastAPI application using:
   ```bash
   uvicorn src.main:app --reload
   ```

5. **Deploy the dashboard**:
   - Navigate to the `admin-dashboard` directory.
   - Deploy the dashboard to Firebase Hosting using:
   ```bash
   firebase deploy
   ```

## Usage Guidelines

- Access the dashboard via the Firebase Hosting URL provided after deployment.
- Use the login page to authenticate as an admin user.
- Once logged in, you can manage payments, licenses, and view statistics through the dashboard interface.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.