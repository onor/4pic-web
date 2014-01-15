import play.api._
import play.api.mvc._
import play.api.mvc.Results._
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._


object Global extends GlobalSettings {
  override def onHandlerNotFound(request: RequestHeader) = {
    NotFound(views.html.handlerNotFound())
  }
}