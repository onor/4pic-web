package e2e.pages;

import org.fluentlenium.core.FluentPage;
import org.fluentlenium.core.domain.FluentList;
import org.openqa.selenium.WebDriver;
// Although Eclipse marks the following two methods as deprecated, 
// the no-arg versions of the methods used here are not deprecated.  (as of May, 2013).
import static org.fluentlenium.core.filter.FilterConstructor.withText; 
import static org.fluentlenium.core.filter.FilterConstructor.withId;  

public class FacebookPage extends FluentPage {
	
  private e2e.TestUser testUser = null;
  
  public FacebookPage (WebDriver webDriver, e2e.TestUser testUser) {
    super(webDriver);
    this.testUser = testUser;
  }
   
  @Override
  public void isAt() {
	await().atMost(10000).until("#email").isPresent();  
  }
  
  public void login() {
	fill("#email").with(this.testUser.email());
	fill("#pass").with(this.testUser.password());
    find("#u_0_e").submit();
  }
  
  public void isLoggedin() {
	await().atMost(4000).until("textarea").isPresent();
  }
  
  
}
