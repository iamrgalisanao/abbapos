# AI Interaction Rules

- Always follow the B.L.A.S.T. protocol.
- Always refer to the Compliance Core when modifying sales logic.
- Do not skip documentation updates.
- Proactively suggest tests and validation steps.
- Maintain `progress.md` and `findings.md` accurately.
- **Branching Awareness**: Always work on a specific feature/fix branch. Never commit directly to `main` unless small/chore documentation updates are explicitly requested.
- **Commit Discipline**: Follow conventional commit formats. Each commit should represent a verifiable step in the B.L.A.S.T. protocol.
- **Documentation Synchronicity**: For every feature/fix implemented, the following files MUST be updated in lockstep BEFORE merging:
    1. **`CHANGELOG.md`**: Add descriptive entry under "[Unreleased]".
    2. **`ROADMAP.md`**: Update milestone/feature completion status.
    3. **`progress.md`**: Update percentage and detailed status to match the Roadmap.
    4. **Feature Records**: Create/update in `context/features/` or `context/fixes/`.
    > [!IMPORTANT]
    > `CHANGELOG.md`, `ROADMAP.md`, and `progress.md` are a "source of truth trinity." They must never drift apart.
- **Testing Enforcement**: Never mark a task as complete without creating/running a corresponding verification script in the `tests/` directory as per [testing-standards.md](testing-standards.md).
- **Security & Hygiene Guardrails**: AI must strictly implement [security-hygiene-guardrails.md](security-hygiene-guardrails.md) at every stage:
    1. **Design**: Ask security review questions before coding.
    2. **Implementation**: Minimize attack surface and structural decay.
    3. **Review**: Perform a mandatory pre-merge hygiene sweep (check for dead/orphaned code).
    4. **Release**: Confirm all high-risk actions (refunds, voids, overrides) are verified and logged.
