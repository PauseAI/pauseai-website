<script>
	import { SvelteComponentDev, prevent_default } from "svelte/internal"
	import Points from './Points.svelte';
	import { onMount } from 'svelte';
	import { get } from "svelte/store"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"

	let points = 0;
	let totalAsked = 0;
	let pointsInstance;
	let started = false; // used to show or not show the intro text.
	let message = '';
	let finished = false;
	let showPrevContext = false;
	let retype = false;
	let curIndex = 0; // used to know what question to ask. 
	let lastCurIndex = 0; // used to not ask the same question twice in a row. 
	let lastQuestion = '';
	let lastContext = '';
	let fase = 0;
	let latestMistakeIndexes = [];
	let tempMessage = 'Reading the data';
	let startIndex = 1;
  	let stopIndex = 10;
	// just initialize, not used, later set by a function. 
	let startIndexOptions = [-1,-2,-3];
	let stopIndexOptions = [-4,-5,-6];

	// Used for the user input, also to display it. 
	let userInput = '';
	let value = '';
	let count = 1;
	let pageFase = 0;
	let goToNextQuestion = false;
	let notYetAsked = [];
	let alreadyAsked = [];
	let weights = []; 
	let nrOfZeros = 0;
	const nrOfNewQuestions = 5; // number of NEW questions in a streak, after that it reaskes the latest mistakes
	const newQuestionsMessage = 'Now asking ' + nrOfNewQuestions.toString() +  ' or less new questions'
	let datasetsHaveLoaded = false;
	// The file is at /static/learn.. but in svelte the static folder contents are available without having to start with /static
	// Files obtained using a combination of https://www.enchantedlearning.com/geography/capitals/bycontinent.shtml
	// And cleaning it up with ChatGPT. 
	// let pathToData = '/learnbyheart_Data/southamerica.txt';
	// let pathToData = '/learnbyheart_Data/asiameast.txt';
	// let pathToData = '/learnbyheart_Data/europe.txt';
	// let pathToData = '/learnbyheart_Data/afrika.txt';
	// let pathToData = '/learnbyheart_Data/northcentralamerikacaribean.txt';
	let pathToData = 'learnbyheart_Data/aifacts.txt'
	// let pathToData = '/learnbyheart_Data/oceaniaaustralia.txt';


	// const landlist = [
	// 	{question: 'What is the capital of East Timor?', answer:'Dili', weight: -1},
	// 	{question: 'What is the capital of the Maldives?', answer:'Male', weight: -1},
	// 	{question: 'What is the capital of UlaanShort?', answer:'Ulaan', weight: -1},
	// 	{question: 'What is the capital of Bangladesh?', answer:'Dhaka', weight: -1},
	// 	{question: 'What is the capital of Qatar?', answer:'Doha', weight: -1},
	// 	{question: 'What is the capital of Kazagstan?', answer:'Astana', weight: -1}
	// ];

	let endMessage = 'You are at the end, the only option now is to hit restart or refresh the page for the same effect'

	// This is a bit of an ugly hack, the server loads the page once before the browser has run the onMount function.
	// In the html it loads dataset[0].question so here I give it some nonsense to load once that the user sees for less than one second.
	let dataset = [{question: 'Loading', answer: 'nonsense', weight: -1, context:'Cool context here'}];
	let datasets = [];
	let datasetNames = [];
	let datasetNamesAndIndexes =[];

	// This onMount function is needed to run this loading of a file operation in the browswer, because the server did not allow a 
	// fetch operation. The text file contains multiple subsets with lines: question;answer;context
	onMount(async () => {
	try {
		const response = await fetch(pathToData); 
		const content = await response.text();
		const lines = content.split('\n');
		dataset = [];
		let datasetIndex = -1; // done to make the first datasetIndex start at -1+1 = 0.
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (line.length === 0) continue;
			if (line.includes('subset')){
				// Add the name of the dataset/subset to the datasets name list.
				let subsetLine = line.split(';');
				const datasetName = subsetLine[1].trim();
				// TODO Remove next line
				// datasetNames.push(datasetName);
				// Create a new array to put in the data
				datasets.push([])
				datasetIndex += 1;
				datasetNamesAndIndexes.push([datasetName,datasetIndex])
			} else { // normal data input line
				let [ques, ans, cont] = line.split(';');
				// trim removes whitespace in front of the text or after it. Makes it more robust
				ques = ques.trim()
				ans = ans.trim();
				cont = cont.trim()
				// All weights are set to -1 to start with. Later it will be updated depending on how many mistakes on has made or correct answers.
				const weight = -1;
				datasets[datasetIndex].push({ question:ques, answer:ans, weight:weight,context:cont });
			}
		}
		// Add the list of subset names as the last position in the datasets list of lists. 
		datasets.push(datasetNames);
		console.log(datasets);

		// // Now populate the select element that chooses the dataset.
		// // Get the select element by its ID
		// const selectElement = document.getElementById("dataset-selector");
		// // Loop through the dataset list and create options dynamically
		// for (let i = 0; i < datasetNames.length; i++) {
		// const option = document.createElement("option");
		// option.text = datasetNames[i];
		// option.value = i.toString();
		// selectElement.appendChild(option);
		// }

	} catch (error) {
		console.error('Error:', error);
	}
	// Set the current dataset hardcoded
	dataset = datasets[0];
	// message the user that 6 NEW questions or less are comming. 
	tempMessage = newQuestionsMessage;

	datasetsHaveLoaded = true;
	});

	// Output: Random integer between min and max so min and max are part of the possible return values. 
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	// This makes a few arrays that keep track of the indexes to questions that have not yet 
	// been asked and those who have been. And an array of the weights. 
	// alreadyAsked and weights are equal in length and correspond to eachother.
	function getScoresAndIndexes(dataset) {
		let notYetAsked = [];
		let alreadyAsked = [];
		let weights = [];
		let nrOfZeros = 0;
		let index = 0;

		for (let entry of dataset) {
			if (entry.weight === -1) {
			notYetAsked.push(index);
			} else if (entry.weight >= 0) {
			alreadyAsked.push(index);
			weights.push(entry.weight);
			}
			// count the number of zeros because the user would like to know how many he knows by heart already
			if (entry.weight === 0) {
			nrOfZeros += 1;
			}
			index += 1;
		}

		return [notYetAsked, alreadyAsked, weights, nrOfZeros];
	}

	// This takes the current weight and if there was a mistake it increases it and if it is 
	// correct it decreases it to a minimum of 0. When the weight = 0 it will not be asked again. 
	function getNewWeight(curWeight, wasMistake) {
		let newWeight;
	
		if (wasMistake) {
			if (curWeight === -1) {
				newWeight = 3;
			} else if (curWeight >= 1) {
				newWeight = curWeight + 2;
			} else if (curWeight === 0.5 || curWeight === 0.25 || curWeight === 0) {
				newWeight = 3;
			}
		} else { // if correct!
			if (curWeight === -1) {
				newWeight = 1;
			} else if (curWeight >= 3) {
				newWeight = curWeight - 2;
			} else if (curWeight === 1) {
				newWeight = 0.5;
			} else if (curWeight === 0.5) {
				newWeight = 0.25;
			} else if (curWeight === 0.25 || curWeight === 0) {
				newWeight = 0;
			}
		}
		return newWeight;
	}

	// This returns one integer, and index that is randomly sampled according to the height of the weight
	// inside the weights array. The index is one of the indexes inside the alreadyAsked array that contains
	// the indexes of questions that have already been asked.
	function getWeightedSample(alreadyAsked, weights) {

		// Filter out entries with weight 0, because those are not allowed to be sampled.
		const nonZeroEntries = alreadyAsked.filter((entry, index) => weights[index] !== 0);
		const nonZeroWeights = weights.filter((weight) => weight !== 0);

		// Calculate the sum of non-zero weights
		const weightSum = nonZeroWeights.reduce((sum, weight) => sum + weight, 0);

		// Randomly sample indexes based on non-zero weights
		// This number is between 0 and the sum of all weights
		let randomNum = Math.random() * weightSum;
		let cumulativeWeight = 0;
		// You should viualize this as a bar from 0 to weightSum.
		// If the weight is large it takes up a large portion of this bar, and small weights take up a small interval of 
		// this bar. 
		// the randomNum lands on a random position on this bar, and where it lands is where we will sample. And 
		// the larger the weight and thus the interval on this bar, the higher the chance randomNum wil 'fall' on it. 
		// now loop all entries and keep going if randomNum is larger than the cumulative weight of that loop cycle
		// and stop the loop when randomNum is inside the winning interval. 
		for (let j = 0; j < nonZeroEntries.length; j++) {
			cumulativeWeight += nonZeroWeights[j];
			if (randomNum <= cumulativeWeight) {
				// Return the index inside nonZeroEntries, that corresponds to one in alreadyAsked.
				return nonZeroEntries[j]
			}
		}
	}

	function handleOnSubmit() {
		// Make it case insensitive by converting the userinput to lowercase and insensitive to a space before or after the input using .tirm()
		userInput = value.trim().toLowerCase(); // I like the name userInput better than value, but in an input bind:.. it has to be called value.
		handleBackEnd(userInput);
	}


	// This is the main function, it handles what happens when text is inputted and enter is pressed. 
	// Everything happens here. 
	function handleBackEnd(userInput) {
		started = true; // this removes the intro text		
		tempMessage = '';
		
		// if not yet at the end, do this
		const currentEntry = dataset[curIndex];
		if (retype) {
			// Do nothing with the userInput, only advance to the next question.
			goToNextQuestion = true;
			retype = false; // reset this bool
			message = '<span style="color: green; font-weight: bold;">' + currentEntry.answer + '</span> was the correct answer . New weight = ' + currentEntry.weight;
		} else { // normal operation
		
			if (userInput == currentEntry.answer.toLowerCase()) { // Correct answer
				const wasMistake = false;
				currentEntry.weight = getNewWeight(currentEntry.weight, wasMistake);
				
				// When the weight is zero, it will not be asked again, let the user know
				if (currentEntry.weight === 0) {
					console.log('Correct! new weight = 0, NICE! You now know this one, it will not show up again');
					message =  '<span style="color: green; font-weight: bold;">' + currentEntry.answer + '</span> was the correct answer! Weight = 0, NICE! You now know this one, it will not show up again. You now know ' + (nrOfZeros + 1).toString() + ' out of ' + dataset.length.toString() + ' answers by heart!';
				} else {
					console.log('Correct! new weight = ' + currentEntry.weight);
					message =  '<span style="color: green; font-weight: bold;">' + currentEntry.answer + '</span> was the correct answer! New weight = ' + currentEntry.weight;
				}
				points += 1; // update this part of the score
				// asked. It is used to display the score
				goToNextQuestion = true;
				totalAsked += 1 // When correct or skipped the totalAsked goes up
			} else if (userInput == 's') { // If 's'; skip this question
				const wasMistake = true;
				currentEntry.weight = getNewWeight(currentEntry.weight, wasMistake);
				goToNextQuestion = true;
				// Only when asking NEW questions the latestMistakesIndexes array should be updated, else it would keep asking wrong questions again
				if (fase === 0){ 
					latestMistakeIndexes.push(curIndex) // Add the mistake index to the list of latest mistakes
				}
				totalAsked += 1 // When correct or skipped the totalAsked goes up
				message = 'Show: <span style="color: green; font-weight: bold;">' + currentEntry.answer + '</span> was the correct answer. New weight = ' + currentEntry.weight;
			// When sr is the input, it counts as a mistake for the points and the user may retype but the retyping is not checked.
			} else if (userInput == 'sr') { 
				const wasMistake = true;
				currentEntry.weight = getNewWeight(currentEntry.weight, wasMistake);
				// Only when asking NEW questions the latestMistakesIndexes array should be updated, else it would keep asking wrong questions again
				if (fase === 0){ 
					latestMistakeIndexes.push(curIndex) // Add the mistake index to the list of latest mistakes
				}
				message = 'You may now retype to practice, this is not checked. \n\n<span style="color: green; font-weight: bold;">' + currentEntry.answer + '</span> was the correct answer. New weight = ' + currentEntry.weight;
				retype = true;
				totalAsked += 1 // When correct or skipped the totalAsked goes up
			// when 0 is entered. Set the weight to zero so that it will not be asked again. 
			} else if (userInput == '0') {
				currentEntry.weight = 0;
				goToNextQuestion = true;
				message = 'Weight set to 0, it will not be asked again';
			}
			 else { // Now the answer was incorrect, it will be asked again without effecting the score
				lastQuestion = '';
				// now value (what the user has entered) is used instead of userInput because it should not be put to lowercase.
				message = '<span style="color: red; font-weight: bold;">' + value + '</span> was incorrect, you may try again';
			}
		}
		if (goToNextQuestion){
			showPrevContext = true;
			lastQuestion = 'Previous: ' + currentEntry.question;
			lastContext = currentEntry.context;
			// const [notYetAsked, alreadyAsked, weights, nrOfZeros] = getScoresAndIndexes(dataset);
			[notYetAsked, alreadyAsked, weights, nrOfZeros] = getScoresAndIndexes(dataset);
			count += 1;
			console.log('count at the start  = %d',count);
			console.log('fase at the start is %d',fase)
			if (fase === 0){ //start fase
				if (count === (nrOfNewQuestions + 1) ) { // This means ask 5 new questions and then go to the wrongRepeat fase 1 fase.
					// only if there are latest mistakes made, shift to fase 1 = wrongRepeat
					if (latestMistakeIndexes.length > 0){
						fase = 1; // move to the wrongRepeat fase to re ask the mistakes
						count = 1; // not zero but one because in this same submit function call it will enter the fase 1 if statement.
					}
					else { // now there are no latest mistakes so go back to fase 0 and ask 1 NEW question
						fase = 0; // go back to start fase
						if (notYetAsked.length === 0){
							fase = 3; // Go to askRandom fase
							count = 1;
							tempMessage = 'All questions have been asked once, now questions will be picked based on their weight'
						} else {
							// message the user that 6 NEW questions or less are comming. 
							tempMessage = newQuestionsMessage;
							const nextIndex = getRandomInt(0, notYetAsked.length -1)
							// Go to the next question that has not been asked before
							curIndex = notYetAsked[nextIndex]; 
							console.log(notYetAsked)
							console.log('curIndex =')
							console.log(curIndex)
						}
						count = 0; // 0 because when entering this if(goToNextQuestion) it will be += 1 to 1
					}					
				}
				else { // for count 1 tot 6, ask a random NEW next question
					if (notYetAsked.length === 0){
						fase = 3; // Go to askRandom fase
						count = 1;
						tempMessage = 'All questions have been asked once, now questions will be picked based on their weight'
					} else {
						const nextIndex = getRandomInt(0, notYetAsked.length -1)
						// Go to the next question that has not been asked before
						curIndex = notYetAsked[nextIndex]; 
						console.log(notYetAsked)
					}
				}		
			}
			if (fase === 1) { // The wrongRepeat fase, to reask the latest mistakes. 
				console.log('Now in fase 1 code')
				console.log('Count in fase 1 = %d',count)
				// if we ran out of latest wrong questions to ask, ask a NEW question and go to fase 0
				if (latestMistakeIndexes.length === 0){
					fase = 0; // go back to start fase
					count = 1;
					// ask the next question as a random NEW question
					if (notYetAsked.length === 0){
						fase = 3; // Go to askRandom fase
						count = 1;
						tempMessage = 'All questions have been asked once, now questions will be picked based on their weight'
					} else { // Ask a NEW question
						// message the user that 5 NEW questions or less are comming. 
						tempMessage = newQuestionsMessage;
						const nextIndex = getRandomInt(0, notYetAsked.length -1)
						// Go to the next question that has not been asked before
						curIndex = notYetAsked[nextIndex]; 
						console.log(notYetAsked)
						console.log('curIndex =')
						console.log(curIndex)
					}
				} else { // Ask a latest mistake
					// Go to the next question that was done uncorrectly just now.
					// message the user that: 
					tempMessage = 'Lets try this one again:';
					console.log('now in front of the shift function')
					console.log(latestMistakeIndexes);
					curIndex = latestMistakeIndexes.shift(); // shift removes the element at index 0 and returns that element
					console.log('currentIndex = ');
					console.log(curIndex);
					console.log('reasking a latest wrong one')
				}
			}
			// the askRandom fase, where a question is randomly sampled with respect to the weights array
			// more mistakes is higher weight is higher chance to be sampled. More correct means lower weight. 
			if (fase === 3) {
				console.log('inside fase 3 if')
				// count does not have to be tracked anymore
				// When all weights are zero we are finished. 
				const sumWeights = weights.reduce((sum, weight) => sum + weight, 0);
				if (sumWeights === 0) {
					finished = true;
					endMessage = 'Congratulations! You did it! All have been learned. Hit restart, or refresh the page to select a new set of questions and continue learning!'	
				// random sample a new curIndex and with it a new question. 
				} else {
					curIndex = getWeightedSample(alreadyAsked,weights)
					// getting the same question twice in a row sucks so do this to prevent that.
					// only when curIndex === lastCurIndex try again to get a unique curIndex. The loop stops if it is different from the last one. 
					// but when there is only one nonzero weight question left, then do not perform this loop. 
					const nonZeroWeights = weights.filter((weight) => weight !== 0);
					if (nonZeroWeights.length > 1) {
						while (curIndex === lastCurIndex) {
							curIndex = getWeightedSample(alreadyAsked,weights)
						}
					}
				}
			}
			goToNextQuestion = false; // reset this bool
			lastCurIndex = curIndex; // Keep track of what the last curIndex was to make sure you do not ask the same one twice in a row
			console.log('count at the end = %d',count)
			console.log('fase at the end = %d',fase)
		}

		pointsInstance.setProcent(points,totalAsked); // Update the score
		value = ''; // reset the text in the input window to blank
		
	}
		
	function handleRestart(){

		pageFase = 0;
		lastQuestion = '';
		lastContext = '';
		startIndex = 1;
		stopIndex = 10;
		points = 0;
		totalAsked = 0;
		started = false; // used to show or not show the intro text.
		message = '';
		finished = false;
		showPrevContext = false;
		curIndex = 0; // used to know what question to ask. 
		pointsInstance.setProcent(points,totalAsked); // Update the score to 0 for the procent value
		// Used for the user input, also to display it. 
		userInput = '';
		value = '';	
		// Reset the weights in the dataset to -1
		for (let i = 0; i < dataset.length; i++) {
			dataset[i].weight = -1;
		}
		// Make the first question be at a random index
		curIndex = getRandomInt(0,dataset.length - 1)
		fase = 0;
		latestMistakeIndexes = [];
		tempMessage = newQuestionsMessage;
	}


  let selectedOption = 0; // Stores the selected option

  // This is to handle choosing the dataset and prepare the index dropdowns to show the right values.  
  function handleDatasetChange(event) {
	// Change the dataset to only be the selected option. 
    selectedOption = +event.target.value; // takes the value integer from the select element and '+' makes it an integer.
	dataset = datasets[selectedOption];
	// maxEndQuestion = dataset.length;

	// These are to generate what is needed to populate the options in the drop down to select the start and end indexes
	// For after this dataset choice is made. 
	// Generate options for start index
	// From 1 to one below the max index
	startIndexOptions = Array.from({ length: dataset.length - 1 }, (_, i) => i + 1);

	// Generate options for stop index, from 2 up to dataset.length this is, it looks confusing but it works. 
	stopIndexOptions = Array.from({ length: dataset.length - 1 }, (_, i) => i + 2);
	// update the page to the next fase, asking the start and end index of the subset to be asked.
	pageFase = 1;
  }

  	// if start index is set to 5, stopIndexOptions should be from 6 to the end
	// This sets the stopIndex dropdown to have the correct only valid options avalailable. 
	function handleStartIndexChange(event) {
		console.log(stopIndexOptions)
		startIndex = +event.target.value; // target.value = a string! Convert to a number using the unary plus operator
		stopIndexOptions = [];
		for (let i = startIndex + 1; i < dataset.length + 1; i++) {
			stopIndexOptions.push(i) 
		}
		if (startIndex >= stopIndex){
			stopIndex = startIndex + 1;
		} 

	}

	function handleStopIndexChange(event) {
		// stopIndex = +event.target.value; // target.value = a string! Convert to a number using the unary plus operator
	}
	
	// When the start button is pressed make sure the dataset is sliced. 
	function handleStart(){
		dataset = dataset.slice(startIndex -1, stopIndex);
		// Make the first question be at a random index
		curIndex = getRandomInt(0,dataset.length - 1)
		console.log(dataset)
		pageFase = 2; // TODO to 2
	}
	
	

</script>

<style>
	.currentQuestion {
		font-weight: bold;
	}
	.custom-button{
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 6px 10px;
		border-radius: 4px;
		background-color: #ff7700;
		color: #ffffff;
		font-size: 16px;
		font-weight: bold;
		text-transform: uppercase;
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.3s ease;
		margin-top: 20px; /* Adjust the value as needed */
	}

	.custom-button-besides-input{
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 3px 10px;
		border-radius: 4px;
		background-color: #ff7700;
		color: #ffffff;
		font-size: 16px;
		font-weight: bold;
		/* text-transform: uppercase; */
		text-decoration: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.3s ease;
		/* margin-top: 20px; Adjust the value as needed */
	}

	.custom-button:hover {
		background-color: #000102;
	}

	/* Make the dropdown for the dataset nice*/
	.select-wrapper {
	border: none;
	border-bottom: 2px solid #ccc;
	padding: 8px 12px;
	font-size: 17px;
	font-weight: bold;
	color: #333;
	cursor: pointer;
	transition: border-bottom-color 0.3s ease;
	font-family: 'Roboto Slab', serif;
	}

	/* Make the more info box have a nice orange border */
	.more-info {
	border: 3px solid orange;
	padding: 10px;
	border-radius: 5px;
	}	

	/* this is to make the buttons skip, retype and set to 0 align horizontally */
	.form-container {
	display: flex;
 	align-items: center;
	}

	/* make the buttons not touch eachother */
	.button-container {
  	margin-left: 10px; /* Adjust the margin as needed */
	}

</style>

<h1>Learn AI facts by heart</h1>
<!-- Only show the intro text and dataset selector dropdown at the start in pageFase 0-->
{#if pageFase == 0}  
	<p>
		This page lets you interactively learn a ton about AI in a way that makes sure you remember most of it! Much more effective than just reading! We created sets of questions about the past and present of AI. You will be asked a question, when you do not know the answer you have a chance to learn from seeing the answer. And you wil be tested later again to see whether you know it by heart. The questions are chosen at random but they have a weight associated with it. The higher the weight the greater the chance it wil be asked again. When you answer correctly the weight goes down and when you answer incorrectly the weight goes up. The goal is to reduce the weight of all the questions to 0 so that you have demonstrated that today you know it all by heart. It works wonders for remembering, but memory can fade so we invite you to try again some time later!   
	</p>
	<!-- <select on:change={handleDatasetChange} class="select-wrapper">
		<option value=0>Click here to select a subject</option>
		<option value=0>History of AI</option>
		<option value=1>AI Safety</option>
		<option value=2>Quotes</option>
		<option value=3>Capitals South America</option>
		<option value=4>Capitals North and Central Amerkia and the Caribean</option>
		<option value=5>Capitals of Europe</option>
	</select> -->

	<!-- Only when the datasets have been loaded by the onMount function, should the dropdown be populated.
	This block of HTML will also run once before the OnMount function is done, then it will not show the dropdown yet.  -->
	{#if datasetsHaveLoaded}
		<select on:change={handleDatasetChange} class="select-wrapper" id="dataset-selector">
			<option value=0>Click here to select a subject</option>
			{#each datasetNamesAndIndexes as nameAndIndex}
				<option value={nameAndIndex[1]}>{nameAndIndex[0]}</option>
			{/each}
		</select>
	{/if}
{/if}
<!-- After the dropdown has been used to select the dataset, ask the user for the start and stop indexes.  -->
{#if pageFase == 1}
<p>You have chosen the {datasetNames[selectedOption]} set. <br>
	This works with repetition until you know the answers by heart, you are encouraged to continue until all weights are 0. To keep it fun we advise you to do around 10 questions per go.
	For example from 1 to 10 or 11 to 20. Please select at which question to start and at which to end in the dropdowns.  
</p>

<!-- This shows the start option first and it cannot be selected.
This select dropdown element does not use bind:value because
When doing that, It would not show the start option on top when loading the page. 
Instead the value of startIndex is set by the handle... function. -->
<select on:change={handleStartIndexChange}>
	<option selected disabled>Start</option>
	{#each startIndexOptions as option}
	  <option value={option}>{option}</option>
	{/each}
</select>

<!-- I could not get it to show the 'end' top entry first when loading the page
but since the 'start' does show, it is ok. 
This uses bind because now the select dropdown for the start index 
can change the shown option in this dropdown such that 
the start index is never higher or the same as the stopindex.:) -->
<select bind:value={stopIndex} on:change={handleStopIndexChange}>
	<option selected disabled>end</option>
	{#each stopIndexOptions as option}
	  <option value={option}>{option}</option>
	{/each}
</select>
  
<p>Your selected set from question {startIndex} to {stopIndex}, is {stopIndex - startIndex + 1} questions long <br><br><strong>Consider writing down your start and end numbers, so you know what not to enter next time.</strong><br><br>GOTTA LEARN THEM ALL! :D  </p>

<button on:click={handleStart} class="custom-button">
	Start
</button>

{/if}

{#if pageFase == 2}
<p>
	Use enter to submit an answer. When you do not know the answer, enter 'sr' to show and retype for practice. Or 's' for show without retyping. When you already know an answer and do not want it to come back again later, enter '0' to set its weight to 0. That is the fast way, or simply use the buttons. NOTE: below the question you can learn more about the previous question!
</p>
  

<div class = '+page'>
	<!-- On the top,show the points. bind:this={pointsInstance}  is put in there to be able to call the setProcent function
	inside the Points component -->
    <Points bind:this={pointsInstance} points={points} totalAsked={totalAsked}/>
	<!-- Show the current question unless we are finshed-->
	{#if message != ''}
	<p>
		{lastQuestion}<br><br>
		{@html message.replace('\n', '<br>')}<br>
	</p>
	{/if}
	{#if tempMessage != ''}
	<p>
		{tempMessage}
	</p>
	{/if}

	{#if finished == false}
	<p class='currentQuestion'>
		{dataset[curIndex].question}
	</p>
	{/if}
	<!-- This form submits on enter or one of the buttons. It gets text input
	from the user. preventDefault makes sure that when input is given, the 
	page does not reset to the top of the page. Before adding that it skips you
	to the top of the page when hitting enter. Not anymore. Great :) -->
	<!-- To stop showing the form at the end, it is surounded by an if.  -->
	{#if finished == false}
	<div class="form-container">
	  <form on:submit|preventDefault={handleOnSubmit}>
		<label>
		  Your answer:
		  <input bind:value />
		</label>
	  </form>
	  <div class="button-container">
		<button on:click={handleOnSubmit} class="custom-button-besides-input">Submit</button>
	  </div>
	  <div class="button-container">
		<button on:click={() => handleBackEnd("s")} class="custom-button-besides-input">Show</button>
	  </div>
	  <div class="button-container">
		<button on:click={() => handleBackEnd("sr")} class="custom-button-besides-input">Show & Retype</button>
	  </div>
	  <div class="button-container">
		<button on:click={() => handleBackEnd("0")} class="custom-button-besides-input">Set to 0</button>
	  </div>
	</div>
  {/if}
	{#if finished == true}
	<p>
		{endMessage}
	</p>
	{/if}
	{#if started == true && showPrevContext == true} 
	<p class=more-info>
		<strong>More info on the previous one</strong><br><br>
		{@html lastContext}
	</p>
	{/if}

	<button on:click={handleRestart} class="custom-button">
		Restart
	</button>
</div>
{/if}


