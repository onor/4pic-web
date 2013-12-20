import sbt._
import play.Project._

object ApplicationBuild extends Build {

  val appName = "onor-webclient"
  val appVersion = "1.0"

  //todo: scribe library is added to lib folder directly
  val appDependencies = Seq(
		filters,//for gzip
    cache,
    "org.webjars" % "angularjs" % "1.2.0", //todo upgrade to non rc version
    "org.webjars" % "requirejs" % "2.1.1",
    "org.webjars" % "bootstrap" % "3.0.0",
    "org.webjars" % "angular-ui-bootstrap" % "0.6.0-1",
    "org.webjars" %% "webjars-play" % "2.2.0"
  )

  val main = play.Project(appName, appVersion, appDependencies)

}
