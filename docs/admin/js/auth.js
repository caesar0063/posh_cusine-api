function checkAuth(){

    const token = localStorage.getItem('token');

    if(!token){
        window.location.href = 'login.html';
        return;
    }

    try {

        const payload = JSON.parse(atob(token.split('.')[1]));

        if(payload.exp * 1000 < Date.now()){
            logout();
        }

    } catch(error){

        logout();

    }

}


function logout(){

    localStorage.removeItem('token');

    localStorage.removeItem('admin');

    window.location.href = 'login.html';

}