const form = document.querySelector('.contact-form');
const usernameInput = document.querySelector('.username-input');
const emailInput = document.querySelector('.email-input');
const passwordInput = document.querySelector('.password-input');
const alertBox = document.querySelector('.form-alert');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  alertBox.style.display = 'none';

  const name = usernameInput.value.trim(); // 👈 map username → name
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !email || !password) {
    showError('Please fill all fields');
    return;
  }

  try {
    const res = await axios.post('/api/v1/auth/register', {
      name,
      email,
      password,
    });
    console.log(res);
    console.log(res.data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    window.location.href = '/index.html';
  } catch (err) {
    let msg =
      err.response.data.err.errorResponse.errmsg ||
      'Something went wrong , Contact Admin';
    if (msg.includes('duplicate key error')) {
      msg = 'Email already exists';
    }
    showError(msg);
  }
});
function showError(message) {
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}
