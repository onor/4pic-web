name := "4picweb"

version := "1.0-SNAPSHOT"

libraryDependencies ++= Seq(
  jdbc,
  anorm,
  cache
)     



play.Project.playScalaSettings

net.litola.SassPlugin.sassOptions := Seq("--compass","-r", "zurb-foundation")
