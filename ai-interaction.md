# AI Interaction Rules

- Always follow the B.L.A.S.T. protocol.
- Always refer to the Compliance Core when modifying sales logic.
- Do not skip documentation updates.
- Proactively suggest tests and validation steps.
- Maintain `progress.md` and `findings.md` accurately.
- **Branching Awareness**: Always work on a specific feature/fix branch. Never commit directly to `main` unless small/chore documentation updates are explicitly requested.
- **Commit Discipline**: Follow conventional commit formats. Each commit should represent a verifiable step in the B.L.A.S.T. protocol.
- **Documentation Maintenance**: For every feature/fix implemented:
    1. Update `CHANGELOG.md` under the "[Unreleased]" section.
    2. Update `ROADMAP.md` status.
    3. Create or update a detailed record in `context/features/` or `context/fixes/`.
    4. Ensure `progress.md` reflects current completion percentage against the roadmap.
