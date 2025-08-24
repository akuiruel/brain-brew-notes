import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCheatSheets } from '@/hooks/useCheatSheets';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import MathRichTextEditor from '@/components/MathRichTextEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import type { ContentItem, CheatSheetCategory } from '@/integrations/firebase/types';

const moveItem = <T,>(array: T[], fromIndex: number, toIndex: number): T[] => {
	const newArray = array.slice();
	const [moved] = newArray.splice(fromIndex, 1);
	newArray.splice(toIndex, 0, moved);
	return newArray;
};
const EditCheatSheet = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const { toast } = useToast();
	const { getCheatSheetById, updateCheatSheet, isOnline } = useCheatSheets();
	
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState<CheatSheetCategory | ''>('');
	const [contentItems, setContentItems] = useState<ContentItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const displayItems = [...contentItems].slice().reverse();
<<<<<<< HEAD
	const sensors = useSensors(
		useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
		useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
	);
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = displayItems.findIndex((i) => i.id === active.id);
		const newIndex = displayItems.findIndex((i) => i.id === over.id);
		const newDisplay = arrayMove(displayItems, oldIndex, newIndex);
=======
	const handlePositionChange = (id: string, newPositionOneBased: number) => {
		const oldIndex = displayItems.findIndex((i) => i.id === id);
		const newIndex = Math.max(0, Math.min(displayItems.length - 1, newPositionOneBased - 1));
		if (oldIndex === -1 || oldIndex === newIndex) return;
		const newDisplay = moveItem(displayItems, oldIndex, newIndex);
>>>>>>> cursor/ubah-urutan-konten-cheat-sheet-dengan-drag-and-drop-0f66
		const newContent = newDisplay.slice().reverse();
		setContentItems(newContent);
	};

	useEffect(() => {
		if (id) {
			fetchCheatSheet();
		}
	}, [id]);

	if (!isOnline) {
		return <Layout><div /></Layout>;
	}
	const fetchCheatSheet = async () => {
		try {
			const data = await getCheatSheetById(id!);

			if (!data) {
				toast({
					title: "Error",
					description: "Cheat sheet not found",
					variant: "destructive",
				});
				navigate('/');
				return;
			}

			setTitle(data.title);
			setDescription(data.description || '');
			setCategory(data.category);
			setContentItems(data.content?.items || []);
		} catch (error) {
			console.error('Error fetching cheat sheet:', error);
			toast({
				title: "Error",
				description: "Failed to fetch cheat sheet",
				variant: "destructive",
			});
			navigate('/');
		} finally {
			setIsFetching(false);
		}
	};

	if (isFetching) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">Loading...</div>
			</div>
		);
	}

	const addContentItem = (type: 'text' | 'math' | 'code') => {
		const newItem: ContentItem = {
			id: crypto.randomUUID(),
			type,
			content: '',
			title: '',
			color: '#000000',
		};
		// Append to keep chronological order; UI shows reversed so it appears at top
		setContentItems(prev => [...prev, newItem]);
	};

	const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
		setContentItems(prev => 
			prev.map(item => item.id === id ? { ...item, ...updates } : item)
		);
	};

	const removeContentItem = (id: string) => {
		setContentItems(prev => prev.filter(item => item.id !== id));
	};

	const handleSave = async () => {
		if (!title.trim()) {
			toast({
				title: "Error",
				description: "Please enter a title for your cheat sheet",
				variant: "destructive",
			});
			return;
		}

		if (!category) {
			toast({
				title: "Error",
				description: "Please select a category",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			await updateCheatSheet(id!, {
				title: title.trim(),
				description: description.trim(),
				category: category as CheatSheetCategory,
				content: { items: contentItems },
			});

			toast({
				title: "Success",
				description: "Cheat sheet updated successfully!",
			});
			
			navigate('/');
		} catch (error) {
			console.error('Error updating cheat sheet:', error);
			toast({
				title: "Error",
				description: "Failed to update cheat sheet",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const renderEditor = (item: ContentItem) => {
		switch (item.type) {
			case 'text':
				return (
					<div>
						<Label>Content</Label>
						<RichTextEditor
							value={item.content}
							onChange={(content) => updateContentItem(item.id, { content })}
							placeholder="Enter text content with color formatting"
							className="mt-2"
						/>
						<div className="mt-2 p-3 border rounded-md bg-muted/50">
							<Label className="text-xs text-muted-foreground">Preview:</Label>
							<Card className="mt-2 h-fit">
								<CardHeader className="pb-2">
									<Badge variant="outline" className="text-xs w-fit bg-blue-50 text-blue-700 border-blue-200">
										📝 Text
									</Badge>
									{item.title && (
										<CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
									)}
								</CardHeader>
								<CardContent className="pt-0">
									<div 
										className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed"
										dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
									/>
								</CardContent>
							</Card>
						</div>
					</div>
				);
			case 'math':
				return (
					<div>
						<Label>Content</Label>
						<MathRichTextEditor
							value={item.content}
							onChange={(content) => updateContentItem(item.id, { content })}
							placeholder="Enter math formulas and text..."
							className="mt-2"
						/>
						<div className="mt-2 p-3 border rounded-md bg-muted/50">
							<Label className="text-xs text-muted-foreground">Preview:</Label>
							<Card className="mt-2 h-fit">
								<CardHeader className="pb-2">
									<Badge variant="outline" className="text-xs w-fit bg-amber-50 text-amber-700 border-amber-200">
										🧮 Math
									</Badge>
									{item.title && (
										<CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
									)}
								</CardHeader>
								<CardContent className="pt-0">
									<div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
										<div 
											className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p]:leading-relaxed"
											dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
										/>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				);
			case 'code':
				return (
					<div>
						<Label>Content</Label>
						<RichTextEditor
							value={item.content}
							onChange={(content) => updateContentItem(item.id, { content })}
							placeholder="Enter code..."
							className="mt-2"
						/>
						<div className="mt-2 p-3 border rounded-md bg-slate-950 text-green-400">
							<Label className="text-xs text-slate-400">Preview:</Label>
							<Card className="mt-2 h-fit bg-background">
								<CardHeader className="pb-2">
									<Badge variant="outline" className="text-xs w-fit bg-green-50 text-green-700 border-green-200">
										💻 Code
									</Badge>
									{item.title && (
										<CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
									)}
								</CardHeader>
								<CardContent className="pt-0">
									<div className="bg-slate-950 text-green-400 p-3 rounded-lg border border-slate-700 font-mono text-sm">
										<div 
											className="[&_p]:mb-1 [&_p]:leading-relaxed [&_span]:text-green-400"
											dangerouslySetInnerHTML={{ __html: item.content || "Type content to see preview..." }}
										/>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<Layout>
			<div className="max-w-4xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold">Edit Cheat Sheet</h1>
					<Button onClick={handleSave} disabled={isLoading} className="gap-2">
						<Save className="h-4 w-4" />
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-1 space-y-4">
						<Card>
							<CardHeader>
								<CardTitle>Basic Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<Label htmlFor="title">Title</Label>
									<Input
										id="title"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										placeholder="Enter cheat sheet title"
									/>
								</div>
								
								<div>
									<Label htmlFor="category">Category</Label>
									<Select value={category} onValueChange={setCategory}>
										<SelectTrigger>
											<SelectValue placeholder="Select category" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="mathematics">Mathematics</SelectItem>
											<SelectItem value="software">Software</SelectItem>
											<SelectItem value="coding">Coding</SelectItem>
											<SelectItem value="study">Study</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor="description">Description</Label>
									<Textarea
										id="description"
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										placeholder="Brief description (optional)"
										rows={3}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Add Content</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<Button
									variant="outline"
									onClick={() => addContentItem('text')}
									className="w-full justify-start gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Text
								</Button>
								<Button
									variant="outline"
									onClick={() => addContentItem('math')}
									className="w-full justify-start gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Math Formula
								</Button>
								<Button
									variant="outline"
									onClick={() => addContentItem('code')}
									className="w-full justify-start gap-2"
								>
									<Plus className="h-4 w-4" />
									Add Code
								</Button>
							</CardContent>
						</Card>
					</div>

					<div className="lg:col-span-2">
						<Card>
							<CardHeader>
								<CardTitle>Content</CardTitle>
							</CardHeader>
							<CardContent>
								{contentItems.length === 0 ? (
									<div className="text-center py-8 text-muted-foreground">
										No content added yet. Use the buttons on the left to add content.
									</div>
												) : (
									<div className="space-y-4">
										{displayItems.map((item, index) => (
											<Card key={item.id} className="relative">
												<CardHeader>
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<span className="text-sm font-medium">
																{item.type === 'text' && 'Text'}
																{item.type === 'math' && 'Math Formula'}
																{item.type === 'code' && 'Code'}
															</span>
															<span className="text-xs text-muted-foreground">#{index + 1}</span>
														</div>
														<div className="flex items-center gap-2">
															<Select value={String(index + 1)} onValueChange={(v) => handlePositionChange(item.id, parseInt(v, 10))}>
																<SelectTrigger className="w-16">
																	<SelectValue placeholder="Pos" />
																</SelectTrigger>
																<SelectContent>
																	{Array.from({ length: displayItems.length }).map((_, i) => (
																		<SelectItem key={i} value={String(i + 1)}>{i + 1}</SelectItem>
																	))}
																</SelectContent>
															</Select>
															<Button size="sm" variant="ghost" onClick={() => removeContentItem(item.id)}>
																<Trash2 className="h-4 w-4" />
															</Button>
														</div>
													</div>
												</CardHeader>
												<CardContent className="space-y-4">
													<div>
														<Label>Title (optional)</Label>
														<Input
															value={item.title || ''}
															onChange={(e) => updateContentItem(item.id, { title: e.target.value })}
															placeholder="Enter section title"
														/>
													</div>
													{renderEditor(item)}
												</CardContent>
											</Card>
										))}
									</div>
								)
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default EditCheatSheet;