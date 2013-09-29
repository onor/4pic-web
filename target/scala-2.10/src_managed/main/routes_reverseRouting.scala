// @SOURCE:/Users/piyushshah/Development/git/fourpic-web/conf/routes
// @HASH:172ffaf96ff574c4cdc2ed3723e121822125be24
// @DATE:Fri Sep 27 09:17:18 PDT 2013

import Routes.{prefix => _prefix, defaultPrefix => _defaultPrefix}
import play.core._
import play.core.Router._
import play.core.j._

import play.api.mvc._


import Router.queryString


// @LINE:17
// @LINE:14
// @LINE:10
// @LINE:7
package controllers {

// @LINE:14
class ReverseApplication {
    

// @LINE:14
def index(): Call = {
   Call("GET", _prefix)
}
                                                
    
}
                          

// @LINE:17
class ReverseAssets {
    

// @LINE:17
def at(file:String): Call = {
   Call("GET", _prefix + { _defaultPrefix } + implicitly[PathBindable[String]].unbind("file", file))
}
                                                
    
}
                          

// @LINE:10
// @LINE:7
class ReverseWebJarAssets {
    

// @LINE:10
def at(file:String): Call = {
   Call("GET", _prefix + { _defaultPrefix } + "webjars/" + implicitly[PathBindable[String]].unbind("file", file))
}
                                                

// @LINE:7
def requirejs(): Call = {
   Call("GET", _prefix + { _defaultPrefix } + "lib/require.js")
}
                                                
    
}
                          
}
                  


// @LINE:17
// @LINE:14
// @LINE:10
// @LINE:7
package controllers.javascript {

// @LINE:14
class ReverseApplication {
    

// @LINE:14
def index : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Application.index",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + """"})
      }
   """
)
                        
    
}
              

// @LINE:17
class ReverseAssets {
    

// @LINE:17
def at : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.Assets.at",
   """
      function(file) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("file", file)})
      }
   """
)
                        
    
}
              

// @LINE:10
// @LINE:7
class ReverseWebJarAssets {
    

// @LINE:10
def at : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.WebJarAssets.at",
   """
      function(file) {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "webjars/" + (""" + implicitly[PathBindable[String]].javascriptUnbind + """)("file", file)})
      }
   """
)
                        

// @LINE:7
def requirejs : JavascriptReverseRoute = JavascriptReverseRoute(
   "controllers.WebJarAssets.requirejs",
   """
      function() {
      return _wA({method:"GET", url:"""" + _prefix + { _defaultPrefix } + """" + "lib/require.js"})
      }
   """
)
                        
    
}
              
}
        


// @LINE:17
// @LINE:14
// @LINE:10
// @LINE:7
package controllers.ref {

// @LINE:14
class ReverseApplication {
    

// @LINE:14
def index(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Application.index(), HandlerDef(this, "controllers.Application", "index", Seq(), "GET", """ Home page
GET        /                      controllers.Assets.at(path="/public", file="index.html")""", _prefix + """""")
)
                      
    
}
                          

// @LINE:17
class ReverseAssets {
    

// @LINE:17
def at(path:String, file:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.Assets.at(path, file), HandlerDef(this, "controllers.Assets", "at", Seq(classOf[String], classOf[String]), "GET", """ Map the JS resource paths""", _prefix + """$file<.+>""")
)
                      
    
}
                          

// @LINE:10
// @LINE:7
class ReverseWebJarAssets {
    

// @LINE:10
def at(file:String): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.WebJarAssets.at(file), HandlerDef(this, "controllers.WebJarAssets", "at", Seq(classOf[String]), "GET", """ Enable webjar based resources to be returned""", _prefix + """webjars/$file<.+>""")
)
                      

// @LINE:7
def requirejs(): play.api.mvc.HandlerRef[_] = new play.api.mvc.HandlerRef(
   controllers.WebJarAssets.requirejs(), HandlerDef(this, "controllers.WebJarAssets", "requirejs", Seq(), "GET", """ Obtain require.js with built-in knowledge of how webjars resources can be
 resolved""", _prefix + """lib/require.js""")
)
                      
    
}
                          
}
                  
      