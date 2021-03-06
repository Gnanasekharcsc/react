/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {DOMTopLevelEventType} from 'legacy-events/TopLevelEventTypes';
import type {ReactSyntheticEvent} from 'legacy-events/ReactSyntheticEventType';

import {eventTargetEventListenerStore} from './DOMModernPluginEventSystem';

export default function accumulateEventTargetListeners(
  event: ReactSyntheticEvent,
  targetContainer: EventTarget,
): void {
  const dispatchListeners = [];
  const dispatchInstances = [];
  const eventTypeMap = eventTargetEventListenerStore.get(targetContainer);
  if (eventTypeMap !== undefined) {
    const type = ((event.type: any): DOMTopLevelEventType);
    const listeners = eventTypeMap.get(type);
    if (listeners !== undefined) {
      const isCapturePhase = (event: any).eventPhase === 1;

      if (isCapturePhase) {
        const captureListeners = Array.from(listeners.captured);

        for (let i = captureListeners.length - 1; i >= 0; i--) {
          const listener = captureListeners[i];
          const {callback} = listener;
          dispatchListeners.push(callback);
          dispatchInstances.push(targetContainer);
        }
      } else {
        const bubbleListeners = Array.from(listeners.bubbled);

        for (let i = 0; i < bubbleListeners.length; i++) {
          const listener = bubbleListeners[i];
          const {callback} = listener;
          dispatchListeners.push(callback);
          dispatchInstances.push(targetContainer);
        }
      }
    }
  }
  // To prevent allocation to the event unless we actually
  // have listeners we check the length of one of the arrays.
  if (dispatchListeners.length > 0) {
    event._dispatchListeners = dispatchListeners;
    event._dispatchInstances = dispatchInstances;
  }
}
