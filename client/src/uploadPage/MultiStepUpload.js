import React from "react";
// import { makeStyles } from '@material-ui/core/styles';
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
// import Button from '@material-ui/core/Button';
// import Typography from '@material-ui/core/Typography';

// steps title
function getSteps() {
	return ["Upload", "Complete", "Done"];
}

// steps content
function getStepContent(stepIndex) {
	switch (stepIndex) {
		case 0:
			return "Select campaign settings...";
		case 1:
			return "What is an ad group anyways?";
		case 2:
			return "This is the bit I really care about!";
		default:
			return "Unknown stepIndex";
	}
}

export default function HorizontalLabelPositionBelowStepper() {
	// setter which step is now active
	const [activeStep, setActiveStep] = React.useState(0);
	// return array of titles
	const steps = getSteps();

	// handlers for next, back and reset
	const handleNext = () => {
		setActiveStep((prevActiveStep) => prevActiveStep + 1);
	};

	// const handleBack = () => {
	//   setActiveStep((prevActiveStep) => prevActiveStep - 1);
	// };

	// const handleReset = () => {
	//   setActiveStep(0);
	// };

	return (
		<div>
			{/* nice visual 1 - 2 - 3 on the top */}
			<Stepper activeStep={activeStep} alternativeLabel>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>

			<div>
				{/* {activeStep === steps.length ? (
          // if it ends, so click after finish, 
          // in my case watch, we don't need it
          <div>
            <Typography>All steps completed</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : ( */}
				<div>
					{/* here we are getting the content for the active step */}
					<div>{getStepContent(activeStep)}</div>
					{/* here are buttons, I need only next */}
					<div>
						{/* <Button
                disabled={activeStep === 0}
                onClick={handleBack}
              >
                Back
              </Button> */}
						<button
							variant="contained"
							color="primary"
							onClick={handleNext}
						>
							{activeStep === steps.length - 1
								? "Finish"
								: "Upload"}
						</button>
					</div>
				</div>
				{/* )} */}
			</div>
		</div>
	);
}
