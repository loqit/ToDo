
const auth = firebase.auth();
const signinBtn = document.getElementById("signin-btn");
const signupBtn = document.getElementById("signup-btn");
const logoutBtn = document.getElementById('logout-btn');

if (signinBtn) {
    signinBtn.addEventListener('click', e => {
        e.preventDefault();
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;

        auth.signInWithEmailAndPassword(email, password)
            .then(cred => {
                const user = cred.user;
                console.log(user);
                localStorage['userId'] = user.uid;
                window.location.replace('../html/boards.html');
            })
            .catch(e => console.log(e.message));

    });
}

if (signupBtn) {
    console.log("signup");
    signupBtn.addEventListener('click', e => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        console.log(email);

        auth.createUserWithEmailAndPassword(email, password)
            .then(cred => {
                const user = cred.user;
                console.log(user);
                localStorage['userId'] = user.uid;
                window.location.replace('../html/boards.html');
            })
            .catch(e => console.log(e.message));

    });
    console.log(signupBtn);
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {

        auth.signOut()
            .then(() => {
                location.replace('../html/index.html');
            });
    });
}







