# Admin Dashboard for My FastAPI App

This README provides an overview of the admin dashboard project, including setup instructions and usage guidelines.

## Project Structure

The project is organized as follows:

```
my-fastapi-app
├── admin-dashboard
│   ├── public
│   │   ├── index.html          # Main HTML file for the dashboard
│   │   ├── login.html          # Login page for user authentication
│   │   ├── css
│   │   │   ├── main.css        # Styles for the main layout
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
│   └── (your existing FastAPI code) # Existing FastAPI application code
└── README.md                    # Documentation for the overall project
```

## Setup Instructions

1. **Clone the Repository**: Clone this repository to your local machine.

2. **Install Dependencies**: Ensure you have the necessary dependencies installed for your FastAPI application. You can use `pip` to install them.

3. **Firebase Configuration**: 
   - Update the `firebase-config.js` file with your Firebase project settings.
   - Ensure that the Firebase project is set up correctly in the Firebase console.

4. **Run the FastAPI Application**: Start your FastAPI application using your preferred method (e.g., `uvicorn`).

5. **Deploy the Dashboard**: 
   - Use Firebase CLI to deploy the dashboard. Run `firebase deploy` from the `admin-dashboard` directory.

## Usage Guidelines

- Access the dashboard by navigating to the URL provided by Firebase Hosting after deployment.
- Use the login page to authenticate as an admin user.
- Once logged in, you will have access to various functionalities, including managing payments, licenses, and viewing statistics.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.