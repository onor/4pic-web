package controllers

import play.api.libs.json._
import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

//todo move to common project
case class PlayerId(id: String, providerId: String)
case class CharityVote(gameKey: Int, playerId: PlayerId, charityId: String)
case class CharityId(charityId:String)

object CharityService extends Controller with GameController {

  private implicit val format3 = Json.format[CharityId]
  private implicit val format2 = Json.format[PlayerId]
  private implicit val format = Json.format[CharityVote]

  def show() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/brands/522ccb2f490122bc02eb0929/charities?page=1&perPage=3&userKey=$userKey"
        WS.
          url(url).
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def votes() = WithGameKey(p = parse.anyContent) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/charityvotes?gameKey=${request.gameKey}&userKey=$userKey"
        WS.
          url(url).
          get.map(res => {
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }

  def vote() = WithGameKeyAndFbid(p = parse.json) {
    implicit request =>
      Async {
        val url = s"$onorUrl/client/v1/charityvotes?gameKey=${request.gameKey}&userKey=$userKey"
        val vote = request.request.body.validate[CharityId].map{
          case charityId =>
          CharityVote(
            gameKey = request.gameKey,
            playerId = PlayerId(request.fbid, "facebook"),
            charityId = charityId.charityId)}
        Logger.error("Vote " + vote)

        WS.
          url(url).
          post(Json.toJson(vote.get)).map(res => {   //todo move get
          if (res.status == 200)
            Ok(res.json)
          else BadRequest(res.body)
        })
      }
  }
}
