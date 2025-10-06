// @ts-check

import { Maybe } from './helpers.js';

export function getEquipmentGroupById(id) {
  const equipments = getEquipmentGroups();
  return equipments.find(group => group.id === Number(id));
}

/** @type {EquipmentGroups | null} */
let equipmentGroupsStore = null

/**
 * 
 * @returns {Group[]}
 */
export function getEquipmentGroups() {
  const baseEquipmentGroups = [
    {
      id: 1,
      title: "Equipmentlist 1",
      description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, alias.",
      equipments: [
        {
          id: 1,
          title: "Equipment 1 content 1",
          description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusantium, alias.",
          done: false,
          groupId: 1
        },
        {
          id: 2,
          title: "Equipment 1 content 2",
          description: "",
          done: true,
          groupId: 1
        },
      ]
    }
  ];
  if (equipmentGroupsStore) return equipmentGroupsStore;
  const equipmentsFromStorage = localStorage.getItem("equipments");
  if (equipmentsFromStorage) {
    try {
      // @ts-ignore
      equipmentGroupsStore = JSON.parse(equipmentsFromStorage);
      // @ts-ignore
      return equipmentGroupsStore;
    } catch (e) {
      localStorage.removeItem("equipments");
    }
  }
  return baseEquipmentGroups;
}

/**
 * 
 * @param {GetGroupParams} params
 * @returns 
 */
export function getGroup({ id, equipments = null }) {
  return Maybe.of(equipments ?? getEquipmentGroups())
    .bind(equipments => equipments.find(group => group.id === Number(id)))
    .get();
}

/**
 * 
 * @param {GetEquipmentParams} params
 * @returns 
 */
export function getEquipment({ groupId = null, equipmentId, group = null }) {
  if (groupId) return Maybe.of(group ?? getGroup({ id: groupId }))
    .bind(group => group.equipments.find(equipment => equipment.id === Number(equipmentId)))
    .get();
  return Maybe.of(getEquipmentGroups())
    .bind(groups => {
      for (const group of groups) {
        for (const equipment of group.equipments) {
          if (equipment.id === equipmentId) return equipment
        }
      }
    })
    .get()
}

/**
 * 
 * @param {GetDataParams} params
 * @returns 
 */
export function getData({ groupId, equipmentId = null }) {
  const equipments = getEquipmentGroups();
  const group = getGroup({ id: groupId, equipments });
  if (equipmentId === null) return { equipments, group };
  const equipment = getEquipment({
    groupId,
    equipmentId,
    group,
  });
  return { equipments, group, equipment };
}

/**
 * 
 * @param {EquipmentGroups?} equipmentGroups 
 */
export function saveEquipments(equipmentGroups = null) {
  equipmentGroups ??= getEquipmentGroups();
  // equipmentGroups.forEach(group => {
  //   if (group.equipments.length === 0) window.dispatch(events.groupHasNoEquipments, { groupId: group.id });
  // })
  equipmentGroupsStore = equipmentGroups;
  localStorage.setItem("equipments", JSON.stringify(equipmentGroups));
}

/**
 * @param {number} id 
 */
export async function getFakeEquipmentsForUser(id) {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}/equipments`);
    /** @type {ServerEquipment[]} */
    const equipments = await response.json();
    return equipments.map(equipment => {
      return {
        id: equipment.id,
        title: equipment.title,
        description: equipment.completed ? 'Done' : 'In progress',
        done: equipment.completed,
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * 
 * @returns {Promise<FakeUser[] | null>}
 */
export async function getFakeUsers() {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
    if (!response.ok) throw new Error('Error fetching users');
    /** @type {User[]} */
    const users = await response.json();
    return users.map(user => {
      return {
        id: user.id,
        name: user.name,
      };
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}