interface Window {
  dispatch: (eventName: string, detail?: Record<string, any>) => void
}

type BaseEquipmentParams = {
  groupId: number;
  equipmentId: number;
};

type ToggleEquipmentParams = BaseEquipmentParams

type RemoveEquipmentParams = BaseEquipmentParams

type EditEquipmentParams = BaseEquipmentParams & {
  title: string;
  description: string;
};

type ShowEditEquipmentFormParams = BaseEquipmentParams;

type ShowEditGroupFormParams = {
  groupId: number;
};

type RemoveAllEquipmentsParams = {
  groupId: number;
};

type RemoveGroupParams = {
  groupId: number;
};

type ShowGetFakeEquipmentsParams = {
  groupId: number;
};

type GroupHasNoEquipmentsParams = {
  groupId: number;
};

type GetDataParams = {
  groupId: number;
  equipmentId?: number | null;
};

type ServerEquipment = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

type GetGroupParams = {
  id: number;
  equipments?: EquipmentGroups | null;
}

type GetEquipmentParams = {
  groupId?: number | null;
  equipmentId: number;
  group?: Group | null;
};

type FilterEquipmentsParams = {
  groupId: number;
  rented: string;
};

type Equipment = {
  id: number;
  groupId: number;
  title: string;
  description: string;
  done: boolean;
};

type Group = {
  id: number;
  title: string;
  description: string;
  equipments: Equipment[];
}

type EquipmentGroups = Group[];

type FakeUser = {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
