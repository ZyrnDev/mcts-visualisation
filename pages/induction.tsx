import { PropsWithChildren, ReactNode, createElement, useState } from "react";
import NextLink from "next/link";
import Image, { StaticImageData } from "next/image";

import CodeControlPicture from "@/public/images/code_controls.png";
import ProblemSelectorPicture from "@/public/images/problem_selector.png";
import ProblemListPicture from "@/public/images/problem_list.png";
import RuntimeConfigurationPicture from "@/public/images/runtime_configuration.png";
import SetVisualisationTypePicture from "@/public/images/set_visualisation_type.png";
import VisualisationOptionsPicture from "@/public/images/visualisation_options.png";

interface ModalProps extends React.HTMLProps<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
}
function Modal({ open, onClose, children, className, ...props }: PropsWithChildren<ModalProps>): ReactNode {
  if (!open) return null;
  return (
    <div {...props}
      className="fixed inset-0 max-h-screen flex justify-center items-center bg-black bg-opacity-70 p-20"
      onClick={onClose}
    >
      <div className={"bg-gray-700 p-4 max-h-full rounded-3xl overflow-auto" + (className ?? "")} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

interface CodeProps extends React.HTMLProps<HTMLPreElement> {
}
function Code({ children, className, ...props }: PropsWithChildren<CodeProps>): ReactNode {
  return (
    <code
      {...props}
      className={"bg-gray-700 text-orange-400 p-1 rounded-md" + (className ?? "")}
    >
      {children}
    </code>
  );
}


interface TermProps extends React.HTMLProps<HTMLSpanElement> {
  definition: string;
  term: string;
}
function Term({ term, definition, className, ...props }: TermProps): ReactNode {
  return (
    <span
      {...props}
      className={"font-bold underline decoration-dotted hover:text-purple-500 decoration-purple-500 " + (className ?? "")}
      title={definition}
    >
      {term}
    </span>
  );
}

interface InstructionProps extends React.HTMLProps<HTMLDivElement> {
  title: string;
  images?: (string | StaticImageData)[];
}
function Instruction({ title, images = [], children, className, ...props }: PropsWithChildren<InstructionProps>): ReactNode {
  const [minimized, setMinimized] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  const Picture = ({ image }: { image: string | StaticImageData }) => image ? <Image src={image} alt={title} className="w-full rounded-md" /> : null;

  return (
    <div {...props} 
      className={"text-lg mt-2 mb-2 bg-gray-700 p-2 rounded-md" + (className ?? "")}
    >
      <span 
        className="font-bold cursor-pointer"
        title={minimized ? "Click to expand" : "Click to minimize"}
        onClick={() => setMinimized(!minimized)}
      >
        {title}{minimized ? " ▼" : " ▲"}
      </span>
      {!minimized && (
        <>
          {children}
          {images.map((image, i) => (
            <a onClick={() => setZoomed(true)} className="cursor-pointer">
              <Picture key={i} image={image} />
            </a>
          )).flatMap((element, i) => [element, <br key={i} />]).slice(0, -1)}
        </>
      )}
      {zoomed && (
        <Modal open={zoomed} onClose={() => setZoomed(false)}>
          <Heading textSize="2xl" className="text-center">{title}</Heading>
          {children}
          {images.map((image, i) => (
              <Picture key={i} image={image} />
          )).flatMap((element, i) => [element, <br key={i} />]).slice(0, -1)}
        </Modal>
      )}
    </div>
  );
}

interface LinkProps extends React.HTMLProps<HTMLAnchorElement> {
  href: string;
  external?: boolean;
}
function Link({ external, children, className, ...props }: PropsWithChildren<LinkProps>): ReactNode {
  const Element = external ? "a" : NextLink;
  return (
    <Element
      {...props}
      className={"underline text-violet-500 decoration-violet-500 hover:text-fuchsia-500 hover:decoration-fuchsia-500 " + (className ?? "")}
    >
      {children}
    </Element>
  );
}

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
}
function Button({ children, className, ...props }: PropsWithChildren<ButtonProps>): ReactNode {
  return (
    <button
      {...props as any}
      className={"text-white p-2 rounded-md shadow-md " + (className ?? "")}
    >
      {children}
    </button>
  );
}

interface HeadingProps extends React.HTMLProps<HTMLHeadingElement> {
  textSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl";
}
function Heading({ children, textSize = "lg", className, ...props }: PropsWithChildren<HeadingProps>): ReactNode {
  const sizeMapping: Record<string, [string, string]> = {
    "xs": ["text-xs",  "h6" as keyof JSX.IntrinsicElements],
    "sm": ["text-sm",  "h6" as keyof JSX.IntrinsicElements],
    "md": ["text-md",  "h5" as keyof JSX.IntrinsicElements],
    "lg": ["text-lg",  "h4" as keyof JSX.IntrinsicElements],
    "xl": ["text-xl",  "h2" as keyof JSX.IntrinsicElements],
    "2xl": ["text-2xl", "h2" as keyof JSX.IntrinsicElements],
    "3xl": ["text-3xl", "h1" as keyof JSX.IntrinsicElements],
    "4xl": ["text-4xl", "h1" as keyof JSX.IntrinsicElements],
    "5xl": ["text-5xl", "h1" as keyof JSX.IntrinsicElements],
    "6xl": ["text-6xl", "h1" as keyof JSX.IntrinsicElements],
  };

  const [textSizeClass, element] = sizeMapping[textSize];

  return createElement(element, {
    className: textSizeClass + " font-bold mb-4 " + (className ?? ""),
    ...props
  }, children);
}

function Centered({ children }: PropsWithChildren<{}>): ReactNode {
  return (
    <div className="flex justify-center">
      {children}
    </div>
  );
}

interface SectionProps extends React.HTMLProps<HTMLDivElement> {
}
function Section({ children, className, ...props }: PropsWithChildren<SectionProps>): ReactNode {
  return (
    <section {...props}
      className={"m-4 p-4 bg-gray-900 text-white rounded-md" + (className ?? "")}
    >
      {children}
    </section>
  );
}

const MonteCarloTreeSearch: () => ReactNode = () => <Term term="Monte-Carlo Tree Search" definition="is a heuristic search algorithm that uses random sampling to search through large decision spaces." />;
const MCTS: () => ReactNode = () => <Term term="MCTS" definition="Monte-Carlo Tree Search" />;

const TicTacToe: () => ReactNode = () => <Term term="Tic-Tac-Toe" definition="is a simple game where two players take turns to place their mark on a 3x3 grid, with the aim of getting three in a row." />;
const NoughtsAndCrosses: () => ReactNode = () => <Term term="Noughts and Crosses" definition="is another name for Tic-Tac-Toe" />;
const XsAndOs: () => ReactNode = () => <Term term="Xs and Os" definition="is another name for Tic-Tac-Toe" />;

export default function Induction(): ReactNode {
  return (
    <main className="max-w-7xl mx-auto my-8">
      <Centered>
        <Heading textSize="6xl" className="inline-block bg-gradient-to-tr from-violet-400 to-fuchsia-600 text-transparent bg-clip-text">
          Induction
        </Heading>
      </Centered>

      <Section>
        <Heading textSize="2xl" className="text-3xl">About This Study</Heading>
          This study is looking at the impact of different visualisation techniques in assisting
          software developers and related professionals in understanding and debugging their applications
          of the <MonteCarloTreeSearch /> algorithm.
          <br /><br />
          The study will require you debug 3 different bugs in an <MCTS /> algorithm implementation.
          These bugs will be all use the same scenario and share the same codebase, just with different bugs.
      </Section>

      <Section>
        <Heading textSize="2xl">The Scenario</Heading>
        You will be using the <MCTS /> algorithm to play a simple game of <TicTacToe />.
        This game is also commonly called <NoughtsAndCrosses /> or <XsAndOs /> in other parts of the world.
        If you are unfamiliar with the game, you can read more about it 
        on <Link href="https://en.wikipedia.org/wiki/Tic-tac-toe" external>Wikipedia</Link>.
        <br /><br />
        The AI will be the starting player (X) and it&apos;s opponent will be the second player (O).
      </Section>

      <Section>
        <Heading textSize="2xl">Finding the Bugs</Heading>
        You will be asked to find and fix the bugs in the codebase.
        Each problem will have just one logical bug and the bug will not be any part of:
          code not shown to you,
          the <Code>Board</Code> class,
          or the <Code>Action</Code> class.
        <br /><br />
        To solve each problem, you will need to identify the bug in the code, writing a fix for it is not required.
        You may still want to write the code to fix the bug as it may help you understand the problem and confirm your solution&apos;s correctness.
        <br /><br />
        You will be given a few visualisations of the algorithm&apos;s results to help you understand the bug with each problem.
        You can compare these to the results to the <Code>Solution</Code> problem to see what the correct output should be.
        <br /><br />
        Please note the that MCTS algorithm uses random sampling, so the results may vary slightly between runs.
        If you are getting inconsistent results, try running the code again with a larger <Code>Max Runtime</Code> and possibly also <Code>Max Iterations</Code>.
      </Section>

      <Section>
        <Heading textSize="2xl">Visualisation</Heading>

        There are four different types of visualisations that you can use which can plot 3 different metrics.

        <Heading textSize="lg" className="mb-1 mt-2">Types:</Heading>
        <ul className="list-disc pl-6">
          <li><Term term="Horizontal Hierarchy" definition="a tree diagram where the root is at the left and the children are to the right" /></li>
          <li><Term term="Vertical Hierarchy" definition="a tree diagram where the root is at the top and the children are below" /></li>
          <li><Term term="Treemap" definition="a diagram where the size of the rectangles represents the value of the node" /></li>
          <li><Term term="Sunburst" definition="a diagram where the size of the arcs represents the value of the node" /></li>
          <li><Term term="JSON" definition="a text representation of the tree in the JSON (JavaScript Object Notation) format" /></li>
        </ul>
        <br />

        <Heading textSize="lg" className="mb-1">Metrics:</Heading>
        <ul className="list-disc pl-6">
          <li><Term term="Visits" definition="the number of times the node was used as part of the initial state of a random simulation" /></li>
          <li><Term term="Score" definition="the sum of the all scores for each simulation from that node or a child" /></li>
          <li><Term term="Expected Value" definition="the average score for a single simulation from that node or a child" /></li>
        </ul>
        <br />

        These visualisations each can help you understand different aspects of the algorithm and the results.
      </Section>

      <Section>
        <Heading textSize="2xl">Usage</Heading>
        The website is not designed for mobile use, so please use a desktop or laptop computer, preferably with a large screen.
        Since the simulation runs in a Python &apos;VM&apos; inside your browser, it can be quite resource intensive.
        Keep this in mind when you are setting the <Code>Max Runtime</Code> and <Code>Max Iterations</Code> values.
        <br /><br />
        If your laptop or desktop is older, you might find the website runs slowly as it the visualisation aren&apos;t well optimised
        for drawing thousands of nodes so you many need to be a little patient.
        <br /><br />
        The visualisations are interactive, so you can hover over parts of the visualisation to see more information.
        Additionally, you click on nodes to expand or collapse them for most visualisations so you can explore the tree in more detail.

        <Heading textSize="lg">User Guide</Heading>
        <Instruction
          title="Using the Inbuilt IDE"
          images={[CodeControlPicture]}
        >
          <p>
            The inbuilt IDE is a simple code editor that allows you to write and run Python code directly in your browser.
            You can use the inbuilt Visual Studio Code text editor to write your code.
            <br /><br />
            Operations
            <ul className="list-disc pl-6">
              <li><Term term="Run" definition="execute the code from the editor in the Python runtime" /></li>
              <li><Term term="Save" definition="save the code from the editor to your browser&apos;s local storage" /></li>
              <li><Term term="Load" definition="load the code from your browser&apos;s local storage into the editor" /></li>
              <li><Term term="Reset" definition="clear the code from the editor and the browser&apos;s local storage, resetting it to the default for the current problem" /></li>
            </ul>
          </p>
        </Instruction>

        <Instruction
          title="Selecting a Template / Problem"
          images={[ProblemSelectorPicture, ProblemListPicture]}
        >
          <p>
            You can select the problem you want to work on from the dropdown list.
            The problems are numbered 1 to 3 and each has a different bug in the code.
            There is an additional problem called <Code>Solution</Code> which shows the correct output for the algorithm with no bugs for you to compare the graphs from the problems to.
            <br /><br />
            The template code for each problem will be loaded into the editor when you select a problem.
            You can then modify the code to try and solve the problem.
          </p>
        </Instruction>

        <Instruction
          title="Configuring the MCTS Simulation"
          images={[RuntimeConfigurationPicture]}
        >
          <p>
            You can configure the maximum runtime in and maximum iterations for the MCTS algorithm.
            The maximum runtime is the maximum time the algorithm can run for in seconds.
            The maximum iterations is the maximum number of iterations the algorithm can run for.
            It will <b>NOT</b> automatically re-run the simulation when you change these values.
            You must explictly run the code again to see the new results as accidently running the code for 100 seconds could cause your browser to hang.
            <br /><br />
            The default values are 0.25 seconds for the maximum runtime and 100,000 for the maximum iterations.
            You can change these values to help you debug the algorithm.
            <br /><br />
            If you are getting inconsistent results, try running the code again with a larger <Code>Max Runtime</Code> and possibly also <Code>Max Iterations</Code>.
            You can tell if which limit was reached by looking at the <Code>Visits</Code> metric on the root node.
          </p>
        </Instruction>

        <Instruction
          title="Visualising the Results"
          images={[SetVisualisationTypePicture, VisualisationOptionsPicture]}
        >
          <p>
            You can select the visualisation type using the navigation bar at the top the of the visualisation pane (on the right-hand side).
            This will allow you to choose between the different visualisation types.
            <br /><br />
            Depending on the visualisation type you choose, you can also select the metric you want to plot and some graph specific options.
            <br /><br />
            The visualisations are interactive, so you can hover over or click on parts of the visualisation to see more information.
            <br /><br />
            Please note that the <Code>Expected Value</Code> metric is the average score for a single simulation from that node or a child.
            Thus it is not available for the Treemap visualisation.
            Also the JSON visualisation is the raw data computed by the simulation, thus there are no options for it.
          </p>
        </Instruction>


      </Section>

      <Section>
        <Heading textSize="2xl">Results</Heading>
        Once you have found the bug in the code or run out of time, you must answer a few questions about your experience.
        This will help me understand how the visualisations impacted your debugging process.
        <br /><br />
        After answering the questions is a great time to take a quick break before starting the next problem.
        Also feel free to save your answers and come back to do the next problem later as each problem is a stand alone task.
        <br /><br />
        The results will be only be used for the purposes of this study and will not be shared with anyone else except through the anonymised results in my final report.
      </Section>

      <Section>
        <Heading textSize="2xl">Questions</Heading>
        The questions will be about your experience with the visualisations and the debugging process.
        They will be a mix of multiple choice and short answer questions.
        <br /><br />
        <ol className="list-decimal pl-6">
          <li>How long did the problem take you?</li>
          <li>What do you think the bug was for this problem? If you ran out of time give your best guess and include code if you think it is helpful.</li>
          <li>On a scale of 1 to 10, how easy was it to find the bug? (1 being hard even for an expert, 10 being easy even for a novice)</li>
          <li>What visualisations did you use to help you find the bug?</li>
          <li>On a scale of 1 to 10, how helpful were the visualisations? (1 being useless, 10 being impossible to solve without)</li>
          <li>What would you change about the visualisations? The is related to the design & usage of the visualisation. If you found any bugs with the visualisations then include that in the next question.</li>
          <li>Any other comments?</li>
        </ol>
      </Section>

      <Section>
        <Heading textSize="2xl">Time Limit</Heading>
        You will have a maximum of 20 minutes to find the bug in each problem.
        If you are unable to find the bug in that time, you can still answer the questions and submit your results.
        <br /><br />
        If you are able to find the bug in less than 20 minutes, you can move on to the next problem early.
        However, I recommend you take a short break between each problem to avoid fatigue.
        <br /><br />
        Please record the time it took you to find the bug in each problem as this will be used in the analysis of the study.
        Additionally, please answer the questions immediately after you have finished a problem as this will help ensure you remember your experience well.
      </Section>

      <Section>
        <Heading textSize="2xl">Summary</Heading>
        If you have any questions please contact me directly so I can help you ASAP.
        <br /><br />
        Before I send you off to start the study, here is a summary of what you will be doing:
        <ul className="list-disc pl-6">
          <li>Finding 1 bug in 3 different problems all looking at the same <TicTacToe /> scenario</li>
          <li>Timing yourself on how long it takes you to find each bug with a maximum time limit of 20 minutes per problem</li>
          <li>Answering a few questions about your experience</li>
          <li>Using the visualisations to help you understand the bugs</li>
          <li>Make sure to send me the results by Friday the 24th of May 2024 as this will be the cut off date for results of my study</li>
        </ul>
      </Section>

      <Section>
        <Heading textSize="2xl">Confirmation</Heading>
        If you are ready to start the study, click the button below to begin.
        <br /><br />
        Have you read all the information on this page?
        <Confirmation />
      </Section>

    </main>
  );
}

function Confirmation(): ReactNode {
  const [confirmedReady, setConfirmedReady] = useState(false);
  const checkReady = () => {
    if (window.confirm("Are you sure you are ready to start the study?")) {
      setConfirmedReady(true);
    }
  };

  const StyledButton = (props: ButtonProps) => <Button {...props} className={"min-w-64 mt-4 font-bold text-lg " + props.className} />;

  const ConfirmButton = confirmedReady ? 
    () => <Link href="/"><StyledButton className="bg-green-800">Let&apos;s Go!</StyledButton></Link> :
    () => <StyledButton onClick={checkReady} className="bg-red-800">Yes</StyledButton>;

  return (
    <Centered>
      <ConfirmButton />
    </Centered>
  );
}