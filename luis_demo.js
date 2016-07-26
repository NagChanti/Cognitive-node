var restify = require('restify');
var builder = require('botbuilder');

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify Server
var prev=0;
var temp=0;
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=13cce74e-a227-4d25-9b55-972c0e8305da&subscription-key=6755b92c0bcd47c49a106e150d4bebca&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

//console.log("hello"+recognizer.entities);
//console.log("hello"+dialog.entities);
// Add intent handlers

dialog.matches('Recharge',[
   
	function (session, args ,next) {
		
		console.log("inside Recharge");
		var task = builder.EntityRecognizer.findEntity(args.entities, 'how much');
		//console.log("entity: "+task);
		//console.log("entity task.entity: "+task.entity);
        session.send("OK we got your request . Just follow the prompts and you can quit at any time by saying 'cancel'.");
		if(task == null)
		{
			builder.Prompts.choice(session, "\n\nChoose a Package", "100|200|300|400|500");

		}
		else{
		 if(!(task.entity== 100 ||task.entity==200 ||task.entity ==300 ||task.entity==400 ||task.entity==500))
		 {
			 session.send("You optioned for the package is not available with us \n\n Check all available option")
			builder.Prompts.choice(session, "\n\nChoose a Package", "100|200|300|400|500"); 
			 
		 }
		 if(task.entity== 100 ||task.entity==200 ||task.entity ==300 ||task.entity==400 ||task.entity==500)
		 {
			
		  next({ response: task });
		 }
		}
		//console.log("hello inside "+session.entities);
		//console.log("hello inside "+args.entities);
		 
    },
    function (session, results) {
		 //var text = args.utterance.trim();
			//	console.log("its from prompt module ---"+text);
        if ((results && results.response)) {
			 temp=parseInt(results.response.entity);
			 
            session.send("You entered Rs '%s'", temp);
			
            builder.Prompts.text(session, "\n\n yes to proceed No to Cancel:\n\n ");
        } else {
			
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
        if (results && results.response) {
            session.send("You entered '%s'", results.response);
			if(results.response=='yes'||results.response=='Yes')
            {
			session.send("Your Transaction will be initiated....Please select the bank");
			builder.Prompts.choice(session, "\n\nChoose Your Bank To Proceed", "HDFC|ICICI|SBI|AXIS|BOI");
			
			}
			if(results.response=='no'||results.response=='No')
            {
			session.send("No Transaction has been  initiated...");
			session.send("you ended the transaction in middle");
			session.beginDialogAction('/Recharge');
			
			}
            
        } else {
            session.endDialog("You canceled.");
        }
    },
   function (session, results) {
	   session.send("Your Transaction has been done successfully done");
	   session.send("\n\n you can make more recharges now");
	   prev=temp;
   },

]);

dialog.matches('Previous Recharge',[
   
	function (session, args ,next) {
		
		console.log("inside Previous Recharge");
		console.log(prev);
		var task = builder.EntityRecognizer.findEntity(args.entities, 'how much');
		//console.log("entity: "+task);
		//console.log("entity task.entity: "+task.entity);
        session.send("OK we got your request . Just follow the prompts and you can quit at any time by saying 'cancel'.");
		if(prev!=0)
		{
			 next({ response: prev });
		}
		if(prev == 0)
		{
			session.send("No Previous transactions were made");
			builder.Prompts.choice(session, "\n\nChoose a Package", "100|200|300|400|500"); 
		}
		
		//console.log("hello inside "+session.entities);
		//console.log("hello inside "+args.entities);
		 
    },
    function (session,results) {
		
        if ((results && results.response)) {
			temp=parseInt(results.response.entity);
			if(prev!=0)
			{
				temp=results.response;
			}
            session.send("You entered Rs '%s'", temp);
			
            builder.Prompts.text(session, "\n\n yes to proceed No to Cancel:\n\n Cancelling will drive your transaction to cancelled .");
        } else {
			
            session.endDialog("You canceled.");
        }
    },
    function (session, results) {
		
        if (results && results.response) {
            session.send("You entered '%s'", results.response);
			if(results.response=='yes'||results.response=='Yes')
            {
			session.send("Your Transaction will be initiated....Please select the bank");
			builder.Prompts.choice(session, "\n\nChoose Your Bank To Proceed", "HDFC|ICICI|SBI|AXIS|BOI");
			
			}
			if(results.response=='no'||results.response=='No')
            {
			session.send("No Transaction has been  initiated...");
			session.send("you ended the transaction in middle");
			session.beginDialogAction('/Recharge');
			
			}
            
        } else {
            session.endDialog("You canceled.");
        }
    },
   function (session, results) {
	   console.log("your prev value"+temp);
	   session.send("Your Transaction has been done successfully done");
	   session.send("\n\n you can make more recharges now");
	   prev=temp;
   },

]);


dialog.onDefault(builder.DialogAction.send("I'm sorry I didn't understand. I can only do a recharge."));