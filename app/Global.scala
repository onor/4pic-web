import play.api._
import play.api.mvc._
import play.api.mvc.Results._
import scala.concurrent.Future
import play.api.libs.concurrent.Execution.Implicits._
import play.filters.gzip.GzipFilter


object Global extends WithFilters(new GzipFilter()) with GlobalSettings {
  override def onHandlerNotFound(request: RequestHeader) = {
    Future{NotFound(views.html.handlerNotFound())}
  }
}