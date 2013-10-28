// Comment to get more information during initialization
logLevel := Level.Warn

// The Typesafe repository
resolvers ++= Seq(
"Sonatype OSS Snasphots" at "https://oss.sonatype.org/content/repositories/snapshots",
"Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
"sonatype-releases" at "https://oss.sonatype.org/content/repositories/releases/"
)

// Use the Play sbt plugin for Play projects
addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.2.0")
