package controllers

import play.api.mvc._
import play.api.Logger
import play.api.libs.ws.WS
import play.api.libs.concurrent.Execution.Implicits._

/**
 * Proxy for campaign service.
 * todo: remove hardcoded brandId
 */
object CampaignService extends Controller with GameController {

  def show() = WithGameKey.async(parse.anyContent) {
    implicit request => {
      val url = s"$onorUrl/client/v1/brands/522ccb2f490122bc02eb0929/campaigns?page=1&perPage=3&userKey=$userKey"
      proxyGet(url)
    }
  }
}
