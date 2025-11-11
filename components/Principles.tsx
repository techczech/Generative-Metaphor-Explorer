
import React from 'react';
import { RobotIcon, InfoIcon } from './Icons';

const ArticleSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-slate-200 pb-3 mb-6">{title}</h2>
    <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
      {children}
    </div>
  </section>
);

const ArticleSubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="mt-8">
    <h3 className="text-2xl font-semibold text-slate-700 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Aside: React.FC<{ icon: React.ReactNode, children: React.ReactNode }> = ({ icon, children }) => (
  <aside className="my-6 p-4 bg-slate-100 border-l-4 border-blue-500 rounded-r-lg flex items-start gap-4">
    <div className="flex-shrink-0 text-blue-500">{icon}</div>
    <div className="text-slate-600 text-base">{children}</div>
  </aside>
);

const Principles: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 animate-fade-in">
        <article className="max-w-prose mx-auto">
            <Aside icon={<RobotIcon className="w-8 h-8" />}>
                <p>This reflection written by Dominik Lukeš first appeared as part of a <a href="https://www.linkedin.com/pulse/how-learn-ai-metaphors-use-chatgpt-metaphor-generation-dominik-lukes/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">newsletter post on LinkedIn</a> in 2023. It is lightly edited.</p>
            </Aside>

            <p className="text-lg text-slate-600 italic mt-8 mb-8">The geneticist Steve Jones once remarked about metaphors and evolution that they go together like statues and bird droppings. This applies pretty much to any complex subject and AI is no exception. Metaphors are great at giving insights but they also let us get away with an illusion of understanding.</p>

            <ArticleSection title="TL;DR">
                <ul className="list-disc list-inside space-y-2">
                    <li>Metaphors give an illusion of understanding AI unless accompanied by actual knowledge of how AI works.</li>
                    <li>Common AI metaphors like "intelligence", "learning", "neural networks", "reasoning" mislead if taken too far.</li>
                    <li>To learn from metaphors, actively seek where they break down. Make tables mapping source to target domain.</li>
                    <li>Use multiple metaphors together to get a richer understanding. Single metaphors mislead.</li>
                </ul>
            </ArticleSection>

            <ArticleSection title="How Metaphors Work: Mappings Between Domains">
                <p>What is metaphor? How does it work? Everyone knows it’s a sort of comparison, but what are we comparing and how? Metaphors get its work done through creating mappings between two domains of knowledge. For example, argument and war. We can say, "they brought the big guns to the argument" and everyone knows what it means because we can project from the domain of war onto the domain of argument.</p>
                <p>Traditionally, people say that the source domain is more concrete or better known but that is not really true. Instead, the metaphor gives us a different way of thinking about the target domain through those mappings. Often, that leads to new ideas or better understanding.</p>
                <p>But this requires that we have something in the target domain to map to the source. If we know literally nothing about the domain we’re projecting to, we cannot improve our thinking about it.</p>
                 <p>Take computer virus, if you know nothing about how computers work, you might think that simply placing two computers next to each other in the same room might spread the virus. But in fact, very little that is true about viruses is true about computer viruses.</p>
            </ArticleSection>

            <ArticleSection title="Metaphors of AI as Examples">
                <p>Most people who resort to metaphors about AI, know very little or almost nothing about the domain of machine learning or Artificial Intelligence. And any metaphors they learn will just give them an illusion of understanding unless they are also accompanied by some knowledge about how AI works that comes from outside the metaphor.</p>
                <p>The same goes for many of the metaphors baked into how we talk about AI. Here are some that we have forgotten are metaphors:</p>
                <ol className="list-decimal list-inside space-y-3 mt-4">
                    <li><strong>Intelligence</strong> in AI is not the same as intelligence as humans - we may actually know more about how machine intelligence works than how human one does.</li>
                    <li><strong>Learning</strong> in machine learning is not the same as a child learning - the machine is learning only in the sense that it is not purely calculating statistics on predefined parameters.</li>
                    <li><strong>Neural network</strong> is not very much like a human neural network - it is based on a mathematical model of the neuron developed in the early 1940s.</li>
                    <li><strong>Reasoning</strong> in reasoning benchmarks. Most modern AI systems are evaluated based on benchmarks that test human reasoning. Therefore, we conclude that they must have somehow learned to reason. But it has very few properties we would expect in a reasoning machine.</li>
                    <li><strong>Algorithms</strong> are another popular metaphor. There are literal algorithms in play but what many people imagine are procedures that resemble step by step instructions. But no such algorithms are encoded in AI.</li>
                </ol>
            </ArticleSection>

            <ArticleSection title="Three Ways of Being Misled by Metaphors">
                <ArticleSubSection title="Source domain leaks">
                    <p>Intelligence, learning, neural net, reasoning - those are all good and useful source domains. The problem is that they often leak mappings that are either irrelevant or misleading. For example, we only ever experience intelligence behaviour tied to some sort of intention. So, many people look for intentions in AI system even if we know quite well what their targets are.</p>
                    <p>Metaphors are great if you are always actively seeking their breaking points. But they are also incredibly leaky ships.</p>
                </ArticleSubSection>

                <ArticleSubSection title="Mappings to nowhere">
                    <p>What’s even worse, is when we have nothing in the target domain to map the metaphor to. Then we just begin inventing things about AI that have no bearing on reality and start expecting things to be true about them that are just not.</p>
                </ArticleSubSection>

                <ArticleSubSection title="Mappings from nowhere">
                     <p>There’s also the opposite variant: **mapping from nowhere**. This is when we make assumptions about the source domain of the metaphor which leads us to running in circles. For example, computers model our logical thinking. But because we don’t actually know exactly how our logical thinking works, we start assuming that our minds actually think using computer-like algorithms.</p>
                </ArticleSubSection>
                 <Aside icon={<InfoIcon className="w-8 h-8" />}>
                     <p>You can learn more about problems with learning only from metaphors in <a href="https://metaphorhacker.net/2019/05/explanation-is-an-event-understanding-is-a-process-how-not-to-explain-anything-with-metaphor/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">this article</a>.</p>
                </Aside>
            </ArticleSection>
            
            <ArticleSection title="Two Productive Ways of Learning from Metaphor">
                <p>Metaphors can be great for inferential learning but they are also great at giving you the illusion of inferential learning. They are a trigger but not a shortcut. If you haven’t done the hard work, metaphors are great at keeping you on the surface.</p>
                
                <ArticleSubSection title="Method 1: Mapping analysis">
                    <p>To generate new inferences with metaphors, you have to find out not-metaphorical things about the target domain. I suggest this simple principle:</p>
                    <blockquote className="border-l-4 border-slate-300 pl-4 my-4 italic text-slate-600 text-xl font-medium">
                        If all you still cannot say something about AI outside of the metaphor, you have not learned anything through the metaphor.
                    </blockquote>
                    <p>But even more importantly, you should be able to say where the metaphor breaks and why. Make a simple table with 4 columns: Something about the source domain, something about the target domain, how they are similar, and how they are different.</p>
                </ArticleSubSection>

                <ArticleSubSection title="Method 2: Metaphor coupling">
                    <blockquote className="border-l-4 border-slate-300 pl-4 my-4 italic text-slate-600 text-xl font-medium">
                        Metaphors are like guinea pigs, you should never just keep the one.
                    </blockquote>
                    <p>The biggest danger a metaphor will pose to you, if you let it crowd out other metaphors. They can be very seductive. But because all metaphors are partial, you can never just have one. Try to come up with as many as you can.</p>
                </ArticleSubSection>
            </ArticleSection>

        </article>
    </div>
  );
};

export default Principles;
