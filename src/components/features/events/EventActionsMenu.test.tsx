import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventActionsMenu } from './EventActionsMenu';

describe('EventActionsMenu', () => {
  it('opens menu on button click and executes actions with stopPropagation', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <EventActionsMenu
        canEdit={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );

    const toggleButton = screen.getByRole('button', { name: "Options de l'événement" });
    expect(screen.queryByRole('menu')).toBeNull();

    // Open menu
    fireEvent.click(toggleButton);
    expect(screen.getByRole('menu')).toBeDefined();

    // Click modifier
    const editButton = screen.getByRole('menuitem', { name: /modifier/i });
    fireEvent.click(editButton);
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();

    // Reopen and delete
    fireEvent.click(toggleButton);
    const deleteButton = screen.getByRole('menuitem', { name: /supprimer/i });
    fireEvent.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('does not display edit option when canEdit is false', () => {
    const handleDelete = vi.fn();

    render(
      <EventActionsMenu
        canEdit={false}
        onEdit={vi.fn()}
        onDelete={handleDelete}
      />
    );

    const toggleButton = screen.getByRole('button', { name: "Options de l'événement" });
    fireEvent.click(toggleButton);

    expect(screen.queryByRole('menuitem', { name: /modifier/i })).toBeNull();
    expect(screen.getByRole('menuitem', { name: /supprimer/i })).toBeDefined();
  });
});
