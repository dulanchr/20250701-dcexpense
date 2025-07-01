let selectedSign = null;
    let selectedAccount = null;
    let formData = {};

    // Your Google Apps Script Web App URL
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzySp2FySd6uWdC1yuPc-t-fmaVKoRNNSynkww-1lXBFRyspRnJBL7K3e_27GIPQ7U/exec';

    // Form validation
    function validateForm() {
      const amount = document.getElementById('amount').value.trim();
      const reason = document.getElementById('reason').value.trim();
      const submitBtn = document.getElementById('submitBtn');
      
      if (amount && selectedSign && selectedAccount && reason) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.3';
      }
    }

    // Sign toggle
    document.querySelectorAll('#sign-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#sign-buttons button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSign = btn.dataset.sign;
        validateForm();
      });
    });

    // Account toggle
    document.querySelectorAll('#account-buttons button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#account-buttons button').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedAccount = btn.dataset.account;
        validateForm();
      });
    });

    // Input validation
    document.getElementById('amount').addEventListener('input', validateForm);
    document.getElementById('reason').addEventListener('input', validateForm);

    // Form submission
    document.getElementById('updateForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      const amount = document.getElementById('amount').value.trim();
      const reason = document.getElementById('reason').value.trim();
      
      formData = {
        amount: amount,
        sign: selectedSign,
        account: selectedAccount,
        reason: reason
      };
      
      showConfirmModal();
    });

    function showConfirmModal() {
      const modal = document.getElementById('confirmModal');
      const confirmText = document.getElementById('confirmText');
      
      const action = formData.sign === 'plus' ? 'added' : 'took';
      const preposition = formData.sign === 'plus' ? 'to' : 'from';
      const accountName = getAccountName(formData.account);
      
      confirmText.textContent = `${action} ${formData.amount} ${preposition} ${accountName}?`;
      modal.classList.add('show');
    }

    function getAccountName(account) {
      switch(account) {
        case 'COM': return 'COM bank';
        case 'PPLS': return 'PPLS bank';
        case 'HAND': return 'money on hand';
        default: return 'account';
      }
    }

    // Modal event listeners
    document.getElementById('cancelBtn').addEventListener('click', function() {
      document.getElementById('confirmModal').classList.remove('show');
    });

    document.getElementById('confirmSubmitBtn').addEventListener('click', function() {
      submitToGoogleSheets();
      document.getElementById('confirmModal').classList.remove('show');
    });

    // Close modal when clicking outside
    document.getElementById('confirmModal').addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('show');
      }
    });

    function submitToGoogleSheets() {      
      // Show loading state
      showNotification('Submitting transaction...', 'success');
      
      fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      .then(() => {
        // no-cors mode doesn't return response data, so we assume success
        showNotification('Transaction recorded successfully!', 'success');
        resetForm();
      })
      .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to record transaction. Please try again.', 'error');
      });
    }

    function showNotification(message, type) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    function resetForm() {
      document.getElementById('updateForm').reset();
      document.querySelectorAll('.selected').forEach(btn => btn.classList.remove('selected'));
      selectedSign = null;
      selectedAccount = null;
      validateForm();
    }

    // Initialize form validation
    validateForm();