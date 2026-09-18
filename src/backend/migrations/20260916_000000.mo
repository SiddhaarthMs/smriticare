import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
  };

  public func migration(_old : {}) : NewActor {
    {
      accessControlState = AccessControl.initState();
    };
  };
};
