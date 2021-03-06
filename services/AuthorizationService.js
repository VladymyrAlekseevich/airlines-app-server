const ServiceAccess = require('../DataAccessLayer/SessionsAccess')
const MySqlAccess = require('../DataAccessLayer/MySqlAccess')

module.exports = class AuthorizationService{
    constructor(){
        this._sessionModelInstance = new ServiceAccess();
        this._DBmodelInstance = new MySqlAccess();
    }

    async authenticateUser(requestData){
        let response = {
            isAuthentificated: false,
            err: null,
            session: null
        }

        try{
            let user = await this._DBmodelInstance.getUser(requestData.login);
            
            if(user?.password !== this._encrypt(requestData))
                throw new Error('Authentification failed: invalid login or password');
            if(user?.role_code !== 'ADM')
                throw new Error('Access denied: admin permissions required')

            this._allow(response)
        }catch(e){
            response.errMessage = e.message;
        }

        return response;
    }

    isAuthorized(sessionID){
        return this._sessionModelInstance.hasSession(sessionID)
    }

    _encrypt(requestData){
        let crypto = require('crypto');

        return crypto.createHash('md5').update(`${requestData.password}::${requestData.login}`).digest('HEX');
    }

    _allow(authenticationState){
        let SESSION_ID = require('crypto').randomBytes(64).toString('hex');
        
        authenticationState.session = {id: SESSION_ID};
        authenticationState.isAuthentificated = true;

        this._sessionModelInstance.addSession(SESSION_ID, {...authenticationState.session});
    }
}