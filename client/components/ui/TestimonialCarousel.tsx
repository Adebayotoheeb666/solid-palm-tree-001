import React from "react";

const testimonials = [
	{
		name: "Jane Doe",
		title: "Product Manager",
		quote: "Pocket Calculyst made my workflow so much faster and easier! Highly recommended.",
		avatar: "https://randomuser.me/api/portraits/women/44.jpg",
	},
	{
		name: "John Smith",
		title: "Data Analyst",
		quote: "The analytics and calculation tools are top-notch. I use it every day!",
		avatar: "https://randomuser.me/api/portraits/men/32.jpg",
	},
	{
		name: "Emily Chen",
		title: "Engineer",
		quote: "A must-have for anyone who needs quick, reliable results.",
		avatar: "https://randomuser.me/api/portraits/women/65.jpg",
	},
	{
		name: "Carlos Rivera",
		title: "Travel Blogger",
		quote: "Booking flights has never been this smooth. The carousel of testimonials is a great touch!",
		avatar: "https://randomuser.me/api/portraits/men/45.jpg",
	},
	{
		name: "Fatima Al-Farsi",
		title: "Consultant",
		quote: "I trust this platform for all my business trips. The customer support is fantastic!",
		avatar: "https://randomuser.me/api/portraits/women/68.jpg",
	},
	{
		name: "Liam O'Connor",
		title: "Entrepreneur",
		quote: "A seamless experience from start to finish. Highly recommended for frequent travelers.",
		avatar: "https://randomuser.me/api/portraits/men/51.jpg",
	},
];

const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => (
	<div className="bg-white rounded-2xl shadow-xl px-12 py-10 flex flex-col max-w-[810px] h-[440px] w-full mx-auto relative border border-[#E7E9FF] overflow-hidden">
		<p className="text-2xl md:text-3xl text-[#20242A] font-semibold leading-relaxed mb-0 w-full pr-0">
			“{testimonial.quote}”
		</p>
		<div className="absolute left-12 bottom-10 flex flex-col items-center w-40">
			<img
				src={testimonial.avatar}
				alt={testimonial.name}
				className="w-16 h-16 rounded-full object-cover border-4 border-[#E7E9FF] shadow mb-2"
			/>
			<div className="font-bold text-lg text-[#20242A] text-center break-words w-full">{testimonial.name}</div>
			<div className="text-sm text-[#A2A2A2] font-medium text-center break-words w-full">{testimonial.title}</div>
		</div>
	</div>
);

const TestimonialCarousel: React.FC = () => {
	const [current, setCurrent] = React.useState(0);

	// Auto-slide every 3 seconds
	React.useEffect(() => {
		const interval = setInterval(() => {
			setCurrent((prev) => (prev + 1) % testimonials.length);
		}, 3000);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="w-full flex flex-col items-center">
			<div className="w-full max-w-md">
				<TestimonialCard testimonial={testimonials[current]} />
			</div>
			<div className="flex gap-2 mt-4">
				{testimonials.map((_, idx) => (
					<span
						key={idx}
						className={`w-2 h-2 rounded-full ${idx === current ? "bg-blue-600" : "bg-gray-300"}`}
					/>
				))}
			</div>
		</div>
	);
};

export default TestimonialCarousel;
