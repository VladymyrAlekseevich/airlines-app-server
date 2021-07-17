const { IDLE_TIME } = require("../consts/session");
const AuthorizationService = require("../services/AuthorizationService")
const cookieParser = require('cookie-parser');

class LoginController{
    constructor(){
        this._loginService = new AuthorizationService();
        this._secretKey = require('crypto').randomBytes(64).toString('HEX');

        this.login = this.login.bind(this)
        this.isUserAuthorized = this.isUserAuthorized.bind(this)
    }
    
    async login(req, res){
        cookieParser(this._secretKey);

        let authorizationStatus = await this._loginService.authenticateUser({
            login: req.body.login,
            password: req.body.password
        })

        if(authorizationStatus.isAuthentificated){
            res.cookie('sid', authorizationStatus.session.id, {
                MaxAge: IDLE_TIME,
                signed: true
            })
        }

        res.send(authorizationStatus)
    }

    isUserAuthorized(req, res){
        cookieParser(this._secretKey);

        let decryptedCookie = cookieParser.signedCookie(req.cookie, this._secretKey);
        let isAuthentificated = this._loginService.isAuthorized(decryptedCookie)
        res.send({isAuthentificated})
    }
}

const loginControllerInst = new LoginController()
module.exports = loginControllerInst