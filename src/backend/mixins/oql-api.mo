import Auth     "mo:caffeineai-oql/Auth";
import Entity   "mo:caffeineai-oql/Entity";
import Executor "mo:caffeineai-oql/Executor";
import Json     "mo:caffeineai-oql/Json";
import Registry "mo:caffeineai-oql/Registry";
import Schema   "mo:caffeineai-oql/Schema";

/// OQL exposure with graceful error handling.
///
/// This mirrors the package `Expose` mixin but, instead of trapping on an
/// invalid or empty query, `execute` returns an empty `Result` so callers
/// (and the PocketIC test lane) never see a reject. `schema` is unchanged.
mixin (config : {
  entities : [Entity.Decl];
}) {

  /// Re-built on every upgrade — entity decls capture closures over actor
  /// fields, which can't be persisted.
  transient let registry : Registry.Registry = Registry.build(config.entities);

  public shared query ({ caller }) func schema() : async Text {
    let access = func (d : Entity.Decl) : Auth.Access = Auth.resolve(d.auth, caller);
    Schema.toJson(Registry.schema(registry, access));
  };

  public shared query ({ caller }) func execute(qJson : Text) : async Executor.Result {
    let access = func (d : Entity.Decl) : Auth.Access = Auth.resolve(d.auth, caller);
    switch (Json.parseQuery(qJson)) {
      case (#err _) { { rows = []; hasMore = false } };
      case (#ok q)  { Executor.runWith(registry, q, access) };
    };
  };

};
