import sbt._
import play.Project._
import net.litola.SassPlugin

object ApplicationBuild extends Build {

  val appName = "onor-webclient"
  val appVersion = "1.0"

  //todo: scribe library is added to lib folder directly
  val appDependencies = Seq(
    "org.webjars" % "angularjs" % "1.2.0", //todo upgrade to non rc version
    "org.webjars" % "jquery" % "2.0.3-1",
    "org.webjars" % "foundation" % "5.0.2",
    "org.webjars" % "modernizr" % "2.6.2-1",
    "org.webjars" % "requirejs" % "2.1.1",
    "org.webjars" % "bootstrap" % "3.0.0",
    "org.webjars" % "angular-ui-bootstrap" % "0.6.0-1",
    "org.webjars" % "webjars-play" % "2.1.0-1"
  )

  val main = play.Project(appName, appVersion, appDependencies).settings( SassPlugin.sassSettings:_* )

}
