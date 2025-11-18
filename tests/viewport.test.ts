// Unit tests for viewport reducer logic

import { describe, it, expect } from 'vitest';
import { gameReducer, initialState } from '../src/redux/reducer';
import {
  toggleMapManipulation,
  setViewportPan,
  setViewportZoom,
  resetViewport,
} from '../src/redux/actions';

describe('Viewport Reducer', () => {
  describe('TOGGLE_MAP_MANIPULATION', () => {
    it('should toggle manipulation enabled from false to true', () => {
      const state = initialState;
      const action = toggleMapManipulation();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.manipulationEnabled).toBe(true);
    });

    it('should toggle manipulation enabled from true to false', () => {
      const state = {
        ...initialState,
        viewport: { ...initialState.viewport, manipulationEnabled: true },
      };
      const action = toggleMapManipulation();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.manipulationEnabled).toBe(false);
    });

    it('should preserve other viewport properties when toggling', () => {
      const state = {
        ...initialState,
        viewport: {
          offsetX: 100,
          offsetY: 50,
          zoom: 1.5,
          manipulationEnabled: false,
        },
      };
      const action = toggleMapManipulation();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(100);
      expect(newState.viewport.offsetY).toBe(50);
      expect(newState.viewport.zoom).toBe(1.5);
      expect(newState.viewport.manipulationEnabled).toBe(true);
    });
  });

  describe('SET_VIEWPORT_PAN', () => {
    it('should set pan offset', () => {
      const state = initialState;
      const action = setViewportPan(100, 200);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(100);
      expect(newState.viewport.offsetY).toBe(200);
    });

    it('should allow negative offsets', () => {
      const state = initialState;
      const action = setViewportPan(-50, -75);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(-50);
      expect(newState.viewport.offsetY).toBe(-75);
    });

    it('should update existing offsets', () => {
      const state = {
        ...initialState,
        viewport: { ...initialState.viewport, offsetX: 100, offsetY: 200 },
      };
      const action = setViewportPan(300, 400);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(300);
      expect(newState.viewport.offsetY).toBe(400);
    });
  });

  describe('SET_VIEWPORT_ZOOM', () => {
    it('should set zoom level', () => {
      const state = initialState;
      const action = setViewportZoom(1.5);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.zoom).toBe(1.5);
    });

    it('should enforce minimum zoom of 0.5', () => {
      const state = initialState;
      const action = setViewportZoom(0.1);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.zoom).toBe(0.5);
    });

    it('should enforce maximum zoom of 3.0', () => {
      const state = initialState;
      const action = setViewportZoom(5.0);
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.zoom).toBe(3.0);
    });

    it('should allow zoom values within range', () => {
      const testValues = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
      
      for (const zoom of testValues) {
        const state = initialState;
        const action = setViewportZoom(zoom);
        const newState = gameReducer(state, action);
        
        expect(newState.viewport.zoom).toBe(zoom);
      }
    });
  });

  describe('RESET_VIEWPORT', () => {
    it('should reset pan offsets to zero', () => {
      const state = {
        ...initialState,
        viewport: {
          offsetX: 100,
          offsetY: 200,
          zoom: 1.5,
          manipulationEnabled: true,
        },
      };
      const action = resetViewport();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(0);
      expect(newState.viewport.offsetY).toBe(0);
    });

    it('should reset zoom to 1.0', () => {
      const state = {
        ...initialState,
        viewport: {
          offsetX: 100,
          offsetY: 200,
          zoom: 2.5,
          manipulationEnabled: true,
        },
      };
      const action = resetViewport();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.zoom).toBe(1.0);
    });

    it('should preserve manipulationEnabled state', () => {
      const state = {
        ...initialState,
        viewport: {
          offsetX: 100,
          offsetY: 200,
          zoom: 1.5,
          manipulationEnabled: true,
        },
      };
      const action = resetViewport();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.manipulationEnabled).toBe(true);
    });

    it('should work when manipulation is disabled', () => {
      const state = {
        ...initialState,
        viewport: {
          offsetX: 100,
          offsetY: 200,
          zoom: 1.5,
          manipulationEnabled: false,
        },
      };
      const action = resetViewport();
      const newState = gameReducer(state, action);
      
      expect(newState.viewport.offsetX).toBe(0);
      expect(newState.viewport.offsetY).toBe(0);
      expect(newState.viewport.zoom).toBe(1.0);
      expect(newState.viewport.manipulationEnabled).toBe(false);
    });
  });
});
