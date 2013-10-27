import sbt._
import cloudbees.Plugin._
import play.Project._

object ApplicationBuild extends Build {

  val appName = "onor-webclient"
  val appVersion = "1.0-SNAPSHOT"

  //todo: scribe library is added to lib folder directly
  val appDependencies = Seq(
    "org.webjars" % "angularjs" % "1.2.0-rc.2", //todo upgrade to non rc version
    "org.webjars" % "requirejs" % "2.1.1",
    "org.webjars" % "bootstrap" % "3.0.0",
    "org.webjars" % "angular-ui" % "0.4.0-1", //todo: check if both angular-ui and angular-ui-bootstrap are needed
    "org.webjars" % "underscorejs" % "1.5.1",
    "org.webjars" % "angular-ui-bootstrap" % "0.6.0-1",
    "org.webjars" %% "webjars-play" % "2.1.0-3",
    "commons-codec" % "commons-codec" % "1.7" //needed for facebook signed_request parsing
  )

  val main = play.Project(appName, appVersion, appDependencies).
    settings(cloudBeesSettings: _*).
    settings(CloudBees.applicationId := Some("zalzero/fourpic-web"), //todo rename to onor-webclient
    CloudBees.deployParams := Map("securityMode" -> "private"))

}
