package controllers

import play.api.mvc._
import play.api.Logger

object Application extends Controller {

  def index = Action { implicit request =>
    Ok(views.html.index())
  }

  def indexPost = Action { implicit request =>
    val sr = request.body.asFormUrlEncoded.get("signed_request").head
    components.SignedRequestUtils.parseSignedRequest(sr, Facebook.FBAppSecret) match {
      case Some(signedRequest) => {
        Redirect(routes.Application.index()).withSession(("fbid", signedRequest.user_id))
      }
      case None => {
        Ok(views.html.redirect(Facebook.FBAppId, Facebook.FBAppSecret, Facebook.FBAppCallback))
      }
    }
  }

}
