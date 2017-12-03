var username = 'jake';
var password = '!Password1';

var fNameSignUp = 'test';
var lNameSignUp = 'test';
var emailSignUp = 'test@test.com';
var usernameSignUp = 'test';
var passwordSignUp = 'Test123!@#';
//Will need to be swapped out after each use
var regCodeSignUp = 'ffj5219';

describe('Users who have signed up ', function() {
  it('should be able to create profile', function() {
    browser.get('http://localhost:3000/');
	// Login to the site
    element(by.id('username')).sendKeys(username);
	element(by.id('password')).sendKeys(password);
	element(by.buttonText('Sign in')).click();
	browser.waitForAngular();
	// Create a profile
	browser.get('http://localhost:3000/profile/create');
	var sortables = element.all(by.repeater('priority in profile.priorities'));
	var source = sortables.get(0);
	var	target = sortables.get(3);
	browser.actions().dragAndDrop(source, target).perform();
	
	var familySlider = element(by.model('profile.satisfactions.Family'));
	browser.actions().dragAndDrop(familySlider, {x:100, y:0}).perform();
	
	var faithSlider = element(by.model('profile.satisfactions.Faith'));
	browser.actions().dragAndDrop(faithSlider, {x:-100, y:0}).perform();

	element(by.buttonText('Save')).click();
	var EC = protractor.ExpectedConditions;
	browser.wait(EC.alertIsPresent(), 5000);
	browser.switchTo().alert().accept();

  });
	
  it('should be able to create goals and rewards', function() {
	// Add Goals
	browser.get('http://localhost:3000/goals');
	browser.waitForAngular();
	element(by.buttonText('New Goal')).click();
	element(by.model('vm.goal.title')).sendKeys('Go to the gym once');
	element(by.model('vm.goal.description')).sendKeys('Go workout at the gym');
	element(by.cssContainingText('option', 'Health')).click();
	element(by.buttonText('Create')).click();
	browser.waitForAngular();
	browser.get('http://localhost:3000/goals');
	browser.waitForAngular();
	element(by.buttonText('New Goal')).click();
	element(by.model('vm.goal.title')).sendKeys('Go to sleep early');
	element(by.model('vm.goal.description')).sendKeys('Stop going to bed late');
	element(by.cssContainingText('option', 'Rest and Relaxation')).click();
	element(by.buttonText('Create')).click();
	browser.waitForAngular();
	browser.get('http://localhost:3000/goals');
	browser.waitForAngular();
	// Add Rewards
	element(by.linkText('Rewards')).click();
	var options = ['Weekly (3 points)', 'Monthly (12 points)', 
					'Quarterly (36 points)', 'Yearly (140 points)'];
	options.forEach(function (x){
		// Go to add a reward page
		element(by.linkText('Add a reward')).click();
		// Add a reward
		element(by.model('vm.reward.name')).sendKeys(x);
		element(by.cssContainingText('option', x)).click();
		element(by.buttonText('Create')).click();
		browser.waitForAngular();

	});
  });
  
  it('should be able to start goals and finish goals' , function() {
	//Start all Goals
	browser.get('http://localhost:3000/goals');
	var startButtons = element.all(by.buttonText('Start'));
	startButtons.get(0).click();
	startButtons.get(1).click();
	browser.waitForAngular();
	var doneButtons = element.all(by.buttonText('Finish'));
	doneButtons.get(0).click();
	doneButtons = element.all(by.buttonText('Finish'));
	doneButtons.get(0).click();
	browser.waitForAngular();
  });
  
  it('should be able to claim a reward', function() {
	browser.get('http://localhost:3000/rewards');
	var rewards = element.all(by.repeater('reward in vm.rewards'));
	rewards.get(0).click();
	browser.waitForAngular();
	element(by.buttonText('Claim!')).click();
	browser.pause(5001);
  });

  it('should be able to sign up for an account with an active registration code', function() {
  	browser.get('http://localhost:3000');
    browser.waitForAngular();
    element(by.buttonText('Sign Up')).click();
    browser.waitForAngular();
    element(by.id('firstName')).sendKeys(fNameSignUp);
    element(by.id('lastName')).sendKeys(lNameSignUp);
    element(by.id('email')).sendKeys(emailSignUp);
    element(by.id('username')).sendKeys(usernameSignUp);
    element(by.id('password')).sendKeys(passwordSignUp);
    element(by.id('registrationKey')).sendKeys(regCodeSignUp);
    element(by.buttonText('Sign up')).click();
    browser.waitForAngular();
	});

});
