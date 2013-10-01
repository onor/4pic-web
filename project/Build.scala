import sbt._
import cloudbees.Plugin._
import play.Project._

object ApplicationBuild extends Build {

  val appName = "angular-seed-play"
  val appVersion = "1.0-SNAPSHOT"

  val appDependencies = Seq(
    "org.webjars" % "angularjs" % "1.1.5-1",
    "org.webjars" % "requirejs" % "2.1.1",
    "org.webjars" % "bootstrap" % "2.3.1-1",
    "org.webjars" % "angular-ui" % "0.4.0-1",
    "org.webjars" % "angular-ui-bootstrap" % "0.3.0-1",
     "org.webjars" %% "webjars-play" % "2.1.0-3"
    )

  val main = play.Project(appName, appVersion, appDependencies).
    settings(cloudBeesSettings: _*).
    settings(CloudBees.applicationId := Some("zalzero/fourpic-web"),
    CloudBees.deployParams := Map("securityMode" -> "private"))

}
