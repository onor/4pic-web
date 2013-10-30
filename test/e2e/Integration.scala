package e2e

import org.specs2.mutable._

import play.api.Logger
import play.api.test._
import play.api.test.Helpers._

import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.WebDriver
import org.openqa.selenium.remote.RemoteWebDriver
import org.openqa.selenium.remote.DesiredCapabilities;

import org.fluentlenium.core.filter.FilterConstructor._
import java.util.concurrent.TimeUnit

import java.net.URL

trait SauceLabs {
  
  val baseUrl = "http://apps.facebook.com/fourpicweb"
  
  def webDriver = {
    val capabilities = DesiredCapabilities.firefox()
    capabilities.setJavascriptEnabled(true)
    new FirefoxDriver(capabilities)
    //new RemoteWebDriver(new URL("http://cloudbees_zalzero:15b88203-7a0f-4339-804a-fffb6abb2e3c@ondemand.saucelabs.com:80/wd/hub"),capabilities)
  }
}

case class TestUser(email:String, password:String)

class Integration extends Specification with SauceLabs{
  
  "login" in new WithBrowser(FIREFOX) {
	  browser.goTo("https://www.facebook.com")
	  
	  FacebookPage.login(browser, TestUser("rudolf.markulin@gmail.com", "mir7rna"))
	  
	  browser.goTo(baseUrl)
	  browser.webDriver.switchTo().frame("iframe_canvas")
	  browser.await().atMost(25000).until("a[class='play-btn']").isPresent()
	  browser.$("a[class='play-btn']").click()
  }
      
}