// @SOURCE:/Users/piyushshah/Development/git/fourpic-web/conf/routes
// @HASH:172ffaf96ff574c4cdc2ed3723e121822125be24
// @DATE:Fri Sep 27 09:17:18 PDT 2013


import play.core._
import play.core.Router._
import play.core.j._

import play.api.mvc._


import Router.queryString

object Routes extends Router.Routes {

private var _prefix = "/"

def setPrefix(prefix: String) {
  _prefix = prefix  
  List[(String,Routes)]().foreach {
    case (p, router) => router.setPrefix(prefix + (if(prefix.endsWith("/")) "" else "/") + p)
  }
}

def prefix = _prefix

lazy val defaultPrefix = { if(Routes.prefix.endsWith("/")) "" else "/" } 


// @LINE:7
private[this] lazy val controllers_WebJarAssets_requirejs0 = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("lib/require.js"))))
        

// @LINE:10
private[this] lazy val controllers_WebJarAssets_at1 = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),StaticPart("webjars/"),DynamicPart("file", """.+""",false))))
        

// @LINE:14
private[this] lazy val controllers_Application_index2 = Route("GET", PathPattern(List(StaticPart(Routes.prefix))))
        

// @LINE:17
private[this] lazy val controllers_Assets_at3 = Route("GET", PathPattern(List(StaticPart(Routes.prefix),StaticPart(Routes.defaultPrefix),DynamicPart("file", """.+""",false))))
        
def documentation = List(("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """lib/require.js""","""controllers.WebJarAssets.requirejs"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """webjars/$file<.+>""","""controllers.WebJarAssets.at(file:String)"""),("""GET""", prefix,"""controllers.Application.index"""),("""GET""", prefix + (if(prefix.endsWith("/")) "" else "/") + """$file<.+>""","""controllers.Assets.at(path:String = "/public", file:String)""")).foldLeft(List.empty[(String,String,String)]) { (s,e) => e.asInstanceOf[Any] match {
  case r @ (_,_,_) => s :+ r.asInstanceOf[(String,String,String)]
  case l => s ++ l.asInstanceOf[List[(String,String,String)]] 
}}
       
    
def routes:PartialFunction[RequestHeader,Handler] = {        

// @LINE:7
case controllers_WebJarAssets_requirejs0(params) => {
   call { 
        invokeHandler(controllers.WebJarAssets.requirejs, HandlerDef(this, "controllers.WebJarAssets", "requirejs", Nil,"GET", """ Obtain require.js with built-in knowledge of how webjars resources can be
 resolved""", Routes.prefix + """lib/require.js"""))
   }
}
        

// @LINE:10
case controllers_WebJarAssets_at1(params) => {
   call(params.fromPath[String]("file", None)) { (file) =>
        invokeHandler(controllers.WebJarAssets.at(file), HandlerDef(this, "controllers.WebJarAssets", "at", Seq(classOf[String]),"GET", """ Enable webjar based resources to be returned""", Routes.prefix + """webjars/$file<.+>"""))
   }
}
        

// @LINE:14
case controllers_Application_index2(params) => {
   call { 
        invokeHandler(controllers.Application.index, HandlerDef(this, "controllers.Application", "index", Nil,"GET", """ Home page
GET        /                      controllers.Assets.at(path="/public", file="index.html")""", Routes.prefix + """"""))
   }
}
        

// @LINE:17
case controllers_Assets_at3(params) => {
   call(Param[String]("path", Right("/public")), params.fromPath[String]("file", None)) { (path, file) =>
        invokeHandler(controllers.Assets.at(path, file), HandlerDef(this, "controllers.Assets", "at", Seq(classOf[String], classOf[String]),"GET", """ Map the JS resource paths""", Routes.prefix + """$file<.+>"""))
   }
}
        
}
    
}
        