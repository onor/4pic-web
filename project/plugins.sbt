// Comment to get more information during initialization
logLevel := Level.Warn

// The Typesafe repository
resolvers ++= Seq(
"Sonatype OSS Snasphots" at "https://oss.sonatype.org/content/repositories/snapshots",
"Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
"sonatype-releases" at "https://oss.sonatype.org/content/repositories/releases/"
)

// Use the Play sbt plugin for Play projects
addSbtPlugin("play" % "sbt-plugin" % "2.1.4")

addSbtPlugin("com.cloudbees.deploy.play" % "sbt-cloudbees-play-plugin" % "0.5-SNAPSHOT")
