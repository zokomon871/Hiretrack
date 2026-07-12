'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Candidate, CandidateStage } from '@prisma/client';
import { updateCandidateStage } from '@/lib/actions/candidates';
import { Card, CardContent } from '@/components/ui/card';

const STAGES: CandidateStage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'];

interface KanbanBoardProps {
  initialCandidates: Candidate[];
}

export function KanbanBoard({ initialCandidates }: KanbanBoardProps) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [isPending, startTransition] = useTransition();

  const [optimisticCandidates, addOptimisticCandidate] = useOptimistic(
    candidates,
    (state: Candidate[], newCandidate: Candidate) => {
      return state.map((c) => (c.id === newCandidate.id ? newCandidate : c));
    }
  );

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const candidate = optimisticCandidates.find(c => c.id === draggableId);
    if (!candidate) return;

    const newStage = destination.droppableId as CandidateStage;
    
    // Optimistic Update
    const updatedCandidate = { ...candidate, stage: newStage };
    startTransition(() => {
      addOptimisticCandidate(updatedCandidate);
      
      // Update actual state
      setCandidates(prev => 
        prev.map(c => c.id === draggableId ? updatedCandidate : c)
      );

      // Server Action
      updateCandidateStage(draggableId, newStage);
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = optimisticCandidates.filter(c => c.stage === stage);
          
          return (
            <div key={stage} className="flex-shrink-0 w-80 bg-muted/50 rounded-lg p-4">
              <div className="font-semibold mb-4 flex items-center justify-between">
                <span>{stage.replace('_', ' ')}</span>
                <span className="text-muted-foreground text-sm bg-muted px-2 py-1 rounded-full">
                  {stageCandidates.length}
                </span>
              </div>
              
              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-muted/80' : ''
                    }`}
                  >
                    {stageCandidates.map((candidate, index) => (
                      <Draggable
                        key={candidate.id}
                        draggableId={candidate.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <Card className="hover:border-primary/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{candidate.name}</div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {candidate.email}
                                    </div>
                                  </div>
                                  <a href={`/dashboard/candidates/${candidate.id}`} className="text-xs text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                                    View
                                  </a>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
