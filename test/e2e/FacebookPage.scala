package e2e
import play.api.test._

object FacebookPage {
	
  def login(browser:TestBrowser, testUser:TestUser) {
    browser.await().atMost(10000).until("#email").isPresent();  
	browser.find("#email").text(testUser.email);
	browser.find("#pass").text(testUser.password);
    browser.find("#u_0_e").submit();
    browser.await().atMost(4000).until("textarea").isPresent();
  } 
}
