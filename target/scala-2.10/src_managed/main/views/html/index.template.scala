
package views.html

import play.templates._
import play.templates.TemplateMagic._

import play.api.templates._
import play.api.templates.PlayMagic._
import models._
import controllers._
import play.api.i18n._
import play.api.mvc._
import play.api.data._
import views.html._
/**/
object index extends BaseScalaTemplate[play.api.templates.Html,Format[play.api.templates.Html]](play.api.templates.HtmlFormat) with play.api.templates.Template0[play.api.templates.Html] {

    /**/
    def apply/*1.2*/():play.api.templates.Html = {
        _display_ {

Seq[Any](format.raw/*1.4*/("""
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Fourpic Hey Hey</title>
        <link rel="stylesheet" href="css/app.css">
        <script data-main="js/app" src="lib/require.js"></script>
        <link rel='stylesheet' href='"""),_display_(Seq[Any](/*9.39*/routes/*9.45*/.WebJarAssets.at(WebJarAssets.locate("css/bootstrap.min.css")))),format.raw/*9.107*/("""'>
    </head>
    <body>
        <header role="banner" class="header">
            Fourpic
        </header>
        <div class="container">
        <div ng-view></div>
        </div>
    </body>
</html>"""))}
    }
    
    def render(): play.api.templates.Html = apply()
    
    def f:(() => play.api.templates.Html) = () => apply()
    
    def ref: this.type = this

}
                /*
                    -- GENERATED --
                    DATE: Sat Sep 28 11:55:44 PDT 2013
                    SOURCE: /Users/piyushshah/Development/git/fourpic-web/app/views/index.scala.html
                    HASH: 249625a3424645a2d907437cb5d14ba3255f42d5
                    MATRIX: 498->1|576->3|881->273|895->279|979->341
                    LINES: 19->1|22->1|30->9|30->9|30->9
                    -- GENERATED --
                */
            