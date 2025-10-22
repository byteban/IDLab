// payment-form.js
// filepath: idlab-website/scripts/payment-form.js
// Global variables
let selectedPlan = null;

// Make functions globally available
window.openPaymentForm = openPaymentForm;
window.closePaymentForm = closePaymentForm;
window.closeSuccessModal = closeSuccessModal;

function openPaymentForm(packageType, durationMonths, amount) {
    selectedPlan = {
        packageType: packageType,
        durationMonths: durationMonths,
        amount: amount
    };
    
    // Update form with selected plan
    const planNameElement = document.getElementById('selected-plan');
    const planPriceElement = document.getElementById('selected-price');
    const licenseTypeField = document.getElementById('license-type');
    const amountPaidField = document.getElementById('amount-paid');
    
    if (planNameElement && planPriceElement) {
        let planName = '';
        if (packageType === 'school_single') {
            planName = `School License - Single Device - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else if (packageType === 'school_multi') {
            planName = `School License - Multiple Devices - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else if (packageType === 'business_single') {
            planName = `Business License - Single Device - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else if (packageType === 'business_multi') {
            planName = `Business License - Multiple Devices - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else if (packageType === 'single_device') {
            planName = `Single Device License - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else if (packageType === 'multi_device') {
            planName = `Multiple Devices License - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        } else {
            // Backward compatibility
            planName = `${packageType === 'school' ? 'School' : 'Business'} - ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'}`;
        }
        
        planNameElement.textContent = planName;
        planPriceElement.textContent = `K${amount}`;
        
        // Auto-fill license type and amount
        if (licenseTypeField) {
            licenseTypeField.value = planName;
        }
        if (amountPaidField) {
            amountPaidField.value = amount;
        }
    }
    
    // Show payment form
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closePaymentForm() {
    const modal = document.getElementById('payment-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset form
    const form = document.getElementById('payment-form');
    if (form) {
        form.reset();
    }
    
    selectedPlan = null;
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

async function uploadPaymentProof(file, licenseData) {
    try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2);
        const filename = `payment_${timestamp}_${randomId}/${file.name}`;
        
        const storageRef = storage.ref(`payment-proofs/${filename}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        return {
            success: true,
            url: downloadURL,
            path: snapshot.ref.fullPath
        };
    } catch (error) {
        console.error('Upload error:', error);
        throw new Error(`Failed to upload payment proof: ${error.message}`);
    }
}

// Payment form submission
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up payment form...');
    
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!selectedPlan) {
                alert('Please select a plan first');
                return;
            }
            
            const formData = new FormData(e.target);
            const paymentProofFile = formData.get('payment-proof');
            
            if (!paymentProofFile || paymentProofFile.size === 0) {
                alert('Please upload payment proof');
                return;
            }
            
            try {
                // Show loading state
                const submitBtn = document.getElementById('submit-payment');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');
                
                if (btnText) btnText.style.display = 'none';
                if (btnLoader) btnLoader.style.display = 'inline-flex';
                submitBtn.disabled = true;
                
                // Upload payment proof
                console.log('Uploading payment proof...');
                const uploadResult = await uploadPaymentProof(paymentProofFile, selectedPlan);
                
                // Prepare license request data
                const licenseData = {
                    school_name: formData.get('school-name'),
                    province: formData.get('province'),
                    license_type: formData.get('license-type'),
                    full_name: formData.get('full-name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    payment_method: formData.get('payment-method'),
                    amount_paid: parseInt(formData.get('amount-paid')),
                    how_heard: formData.get('how-heard'),
                    package_type: selectedPlan.packageType,
                    duration_months: selectedPlan.durationMonths,
                    amount: selectedPlan.amount,
                    payment_proof_url: uploadResult.url,
                    payment_proof_path: uploadResult.path,
                    status: 'pending',
                    created_at: firebase.firestore.Timestamp.now()
                };
                
                // Save to Firestore
                console.log('Saving license request...');
                console.log('License data:', licenseData);
                const docRef = await db.collection('license_requests').add(licenseData);
                console.log('License request saved with ID:', docRef.id);
                
                // Close payment form and show success modal
                closePaymentForm();
                showSuccessModal();
                
            } catch (error) {
                console.error('Payment submission error:', error);
                alert('Error submitting license request. Please try again or contact support.');
            } finally {
                // Reset button state
                const submitBtn = document.getElementById('submit-payment');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');
                
                if (btnText) btnText.style.display = 'inline';
                if (btnLoader) btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
        
        console.log('Payment form event listener attached');
    } else {
        console.warn('Payment form not found');
    }
    
    // Add file selection visual feedback
    const fileInput = document.getElementById('payment-proof');
    const uploadText = document.querySelector('.file-upload-text span');
    const uploadIcon = document.querySelector('.file-upload-text iconify-icon');
    
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (fileInput.files && fileInput.files[0]) {
                const fileName = fileInput.files[0].name;
                uploadText.textContent = fileName;
                uploadIcon.setAttribute('icon', 'material-symbols:check-circle');
                uploadIcon.style.color = '#1bc098';
            } else {
                uploadText.textContent = 'Click to upload screenshot of payment confirmation';
                uploadIcon.setAttribute('icon', 'material-symbols:cloud-upload');
                uploadIcon.style.color = '';
            }
        });
    }
});

console.log('Payment form script loaded successfully');